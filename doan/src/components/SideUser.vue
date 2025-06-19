<template>
    <aside class="sidebar sidebar-fixed">
      <h2 class="logo">Travalizer</h2>
      <nav>
        <ul>
          <li>
            <router-link to="/userpage" exact-active-class="active">Thông tin</router-link>
          </li>
          <li>
            <router-link to="/rental-motor" exact-active-class="active">Xe đã thuê</router-link>
          </li>
          <li>
            <router-link to="/changepassword" exact-active-class="active">Đổi mật khẩu</router-link>
          </li>
        </ul>
      </nav>
    </aside>
  </template>
  
  <script>
  export default {
    name: "Sidebar",
  };
  </script>
  
  <style scoped>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 250px;
    background-color: #f8f9fa;
    overflow-y: auto;
    border-right: 1px solid #ddd;
    padding: 24px;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  }
  
  .logo {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #343a40;
  }
  
  .sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .sidebar li {
    margin-bottom: 12px;
  }
  
  .sidebar a {
    display: block;
    padding: 12px 16px;
    color: #343a40;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: background 0.2s, color 0.2s;
  }
  
  .sidebar a:hover {
    background-color: #e2e6ea;
  }
  
  .sidebar a.active {
    background-color: #007bff;
    color: #fff;
  }
  </style>
  