import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { admin, logout } = useAuth();

  return (
    <div
      style={{
        padding: 40,
        color: "#fff",
        background: "#0c1018",
        minHeight: "100vh",
      }}
    >
      <h1>Welcome, {admin?.name || "Admin"} 👋</h1>
      <p>This is a placeholder dashboard. Real dashboard features come next.</p>
      <button
        onClick={logout}
        style={{ marginTop: 20, padding: "10px 20px", cursor: "pointer" }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
