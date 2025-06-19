import { createRouter, createWebHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import SignUp from "@/components/SignUp.vue";
import Login from "@/components/Login.vue"; 
import AdminView from "@/views/AdminView.vue"; 
import AboutView from "@/views/AboutView.vue"; 
import MotorList from "@/components/MotorList.vue"; 
import MotorDetail from "@/components/MotorDetail/MotorDetail.vue"; 
import MotorAdmin from "@/components/MotorAdmin/MotorAdmin.vue"; 
import RentalAdmin from "@/components/RentalAdmin.vue"; 
import RentalUser from "@/components/RentalUser.vue"; 
import ReviewAdmin from "@/components/ReviewAdmin.vue"; 
import UserPage from "../components/UserPage.vue";
import Policy from "../components/Policy.vue";
import TimeMotor from "../components/TimeMotor.vue";
import PaymentsAdmin from "@/components/PaymentsAdmin.vue";
import FotgotPassword from "@/components/ForgotPassword.vue";
import ResetPassword from "@/components/ResetPassword.vue";
import StatsChart from "@/components/StatsChart.vue";
import SurchargesAdmin from "@/components/SurchargesAdmin.vue"; 
import SurchargeLookup from "@/components/SurchargeLookup.vue";
import ChangePassword from "@/components/ChangePassword.vue";
import VehicleTypeAdmin from "@/components/VehicleTypeAdmin.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
  {
    path: "/sign-up",
    name: "sign-up",
    component: SignUp,
  },
  {
    path: "/userpage",
    name: "userpage",
    component: UserPage,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/forgotpassword",
    name: "forgotpassword",
    component: FotgotPassword,
  },
  {
    path: "/resetpassword",
    name: "resetpassword",
    component: ResetPassword,
  },
  {
    path: "/changepassword",
    name: "changepassword",
    component: ChangePassword,
  },
  {
    path: "/motorbikes",
    name: "motorbikes",
    component: MotorList,
  },
  {
    path: "/policy",
    name: "policy",
    component: Policy,
  },
  {
    path: "/TimeMotor",
    name: "TimeMotor",
    component: TimeMotor,
  },
  {
    path: "/surcharge",
    name: "surcharge",
    component: SurchargeLookup,
  },
  {
    path: "/motorbikes/:id",
    name: "motor-detail",
    component: MotorDetail,
    props: true,
  },
  {
    path: "/rental-motor",
    name: "rental-motor",
    component: RentalUser,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "vehicle-type",
        name: "vehicle-type-admin",
        component: VehicleTypeAdmin,
      },
      {
        path: "motorbikes",
        name: "motor-admin",
        component: MotorAdmin,
      },
      {
        path: "rentals",
        name: "rental-admin",
        component: RentalAdmin,
      },
      {
        path: "reviews", 
        name: "review-admin",
        component: ReviewAdmin,
      },
      {
        path: "payments", 
        name: "payments-admin",
        component: PaymentsAdmin,
      },
      {
        path: "surcharges",
        name: "surcharges-admin",
        component: SurchargesAdmin,
      },
      {
        path: "stats", 
        name: "stats-chart",
        component: StatsChart,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const name = localStorage.getItem("name") || sessionStorage.getItem("name");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");

  if (to.matched.some((record) => record.meta.requiresAuth) && !name) {
    return next({ name: "login" });
  }

  if (to.matched.some((record) => record.meta.requiresAdmin) && role !== "admin") {
    return next({ name: "home" });
  }

  next();
});

export default router;
