import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  data() {
    return {
      motorbikes: [],
      filteredMotorbikes: [],
      vehicleTypes: [],
      searchQuery: "",
      selectedStatus: "",
      currentPage: 1,
      itemsPerPage: 10,
      showEditModal: false,
      showAddModal: false,
      originalVehicleTypeId: null,
      selectedBike: {
        brand: "",
        model: "",
        vehicle_type_id: null,
        description: "",
        year: null,
        license_plate: "",
        price_per_day: null,
        status: "available",
        image: null
      },
      newBike: {
        brand: "",
        model: "",
        vehicle_type_id: 1,
        description: "",
        year: null,
        license_plate: "",
        price_per_day: null,
        status: "available",
        image: null
      }
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.filteredMotorbikes.length / this.itemsPerPage);
    },
    paginatedMotorbikes() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredMotorbikes.slice(start, start + this.itemsPerPage);
    }
  },

  created() {
    this.fetchMotorbikes();
    this.fetchVehicleTypes();
  },

  setup() {
    const toast = useToast();
    return { toast };
  },

  methods: {
    async fetchMotorbikes() {
      try {
        const response = await axios.get("http://localhost:5000/api/motorbikes?role=admin");
        this.motorbikes = response.data;
        this.filterMotorbikes();
      } catch (error) {
        console.error("Lỗi khi tải danh sách xe: ", error);
        this.toast.error("Lỗi khi tải danh sách xe.");
      }
    },

    async fetchVehicleTypes() {
      try {
        const response = await axios.get("http://localhost:5000/api/vehicletype");
        this.vehicleTypes = response.data.map(item => ({
          id: item.ID,
          name: item.TypeName,
          quantity: item.Quantity || 0
        }));
      } catch (error) {
        console.error("Lỗi khi tải loại xe: ", error);
        this.toast.error("Lỗi khi tải danh sách loại xe.");
      }
    },

    filterMotorbikes() {
      this.filteredMotorbikes = this.motorbikes.filter(bike => {
        const bikeStatus = bike.status?.trim().toLowerCase();
        const selectedStatus = this.selectedStatus.trim().toLowerCase();
        const matchesSearch =
          this.searchQuery === "" ||
          bike.brand.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          bike.model.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          bike.license_plate.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = this.selectedStatus === "" || bikeStatus === selectedStatus;
        return matchesSearch && matchesStatus;
      });
      this.currentPage = 1;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    getStatusClass(status) {
      return status?.trim().toLowerCase() === "rented"
        ? "rented"
        : status?.trim().toLowerCase() === "maintenance"
        ? "maintenance"
        : "available";
    },

    shortDescription(description) {
      return description ? (description.length > 15 ? description.substring(0, 15) + "..." : description) : "Không có mô tả";
    },

    getVehicleTypeLabel(id) {
      const found = this.vehicleTypes.find(type => type.id === id);
      return found ? found.name : "Không xác định";
    },

    openEditModal(bike) {
      this.selectedBike = { ...bike };
      this.originalVehicleTypeId = bike.vehicle_type_id;
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.selectedBike = {
        brand: "",
        model: "",
        vehicle_type_id: null,
        description: "",
        year: null,
        license_plate: "",
        price_per_day: null,
        status: "available",
        image: null
      };
      this.originalVehicleTypeId = null;
    },

    handleEditImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedBike.image = file;
      }
    },

    async saveEdit() {
      try {
        const formData = new FormData();
        for (const key in this.selectedBike) {
          if (key === "image" && this.selectedBike.image instanceof File) {
            formData.append("image", this.selectedBike.image);
          } else {
            formData.append(key, this.selectedBike[key]);
          }
        }

        await axios.put(`http://localhost:5000/api/motorbikes/${this.selectedBike.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (this.originalVehicleTypeId !== this.selectedBike.vehicle_type_id) {
          const oldType = this.vehicleTypes.find(t => t.id === this.originalVehicleTypeId);
          const newType = this.vehicleTypes.find(t => t.id === this.selectedBike.vehicle_type_id);
          if (oldType) oldType.quantity = Math.max(0, oldType.quantity - 1);
          if (newType) newType.quantity += 1;
        }

        this.fetchMotorbikes();
        this.closeEditModal();

        this.toast.success("Cập nhật xe thành công!");
      } catch (error) {
        console.error("Lỗi khi cập nhật xe:", error);
        this.toast.error("Lỗi khi cập nhật xe.");
      }
    },

    async deleteBike(id) {
      if (confirm("Bạn có chắc muốn xóa xe này?")) {
        try {
          await axios.delete(`http://localhost:5000/api/motorbikes/${id}`);
          this.motorbikes = this.motorbikes.filter(bike => bike.id !== id);
          this.filterMotorbikes();
          this.toast.success("Đã xóa xe.");
        } catch (error) {
          console.error("Lỗi khi xóa xe: ", error);
          this.toast.error("Lỗi khi xóa xe.");
        }
      }
    },

    addMotorbike() {
      this.showAddModal = true;
      this.newBike = {
        brand: "",
        model: "",
        vehicle_type_id: 1,
        description: "",
        year: null,
        license_plate: "",
        price_per_day: null,
        status: "available",
        image: null
      };
    },

    closeAddModal() {
      this.showAddModal = false;
      this.newBike = {
        brand: "",
        model: "",
        vehicle_type_id: 1,
        description: "",
        year: null,
        license_plate: "",
        price_per_day: null,
        status: "available",
        image: null
      };
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      this.newBike.image = file;
    },

    async saveNewBike() {
      try {
        const formData = new FormData();
        for (const key in this.newBike) {
          formData.append(key, this.newBike[key]);
        }

        const response = await axios.post("http://localhost:5000/api/motorbikes", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        const newType = this.vehicleTypes.find(t => t.id === this.newBike.vehicle_type_id);
        if (newType) newType.quantity += 1;

        this.motorbikes.push(response.data);
        this.filterMotorbikes();
        this.closeAddModal();

        this.toast.success("Thêm xe mới thành công!");
      } catch (error) {
        console.error("Lỗi khi thêm xe:", error);
        this.toast.error("Lỗi khi thêm xe.");
      }
    }
  }
};