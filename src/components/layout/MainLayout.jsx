import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import ReviewModal from "../ReviewModal/ReviewModal";

function MainLayout() {
  return (
    <div>

      <Navbar />

      <main>
        <Outlet />
      </main>

      <ReviewModal />

    </div>
  );
}

export default MainLayout;