import "./assets/style/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import { useUserStore } from "./store/userStore";
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';  // THÊM DÒNG NÀY


// Import thư viện icon từ file riêng
import './font-awesome-icons';

// Đăng ký component FontAwesome
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);

// Khởi tạo app
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(Toast);


const userStore = useUserStore();
const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

if (storedToken) {
  console.log("Token tìm thấy:", storedToken);
  userStore.token = storedToken;
  axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

  userStore.fetchUser().then(() => {
    if (userStore.user && userStore.user.id) {
      localStorage.setItem("user_id", userStore.user.id.toString());
      console.log("Lưu user_id vào localStorage:", userStore.user.id);
    } else {
      console.warn("Không tìm thấy user_id trong thông tin người dùng!");
    }
  }).catch((error) => {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
  });

} else {
  console.warn("Không tìm thấy token khi khởi động ứng dụng!");
}

userStore.$onAction(({ name }) => {
  if (name === "logout") {
    console.log("Đăng xuất, xóa token và user_id...");
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    sessionStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    userStore.token = null;
    userStore.user = null;
    router.push("/login");
  }
});

app.mount("#app");
