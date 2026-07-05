

import HeaderComponent from "@/components/Header/Header";
import FooterComponent from "@/components/Footer/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <HeaderComponent />
      <main>{children}</main>
      <FooterComponent />
    </>
  );
}