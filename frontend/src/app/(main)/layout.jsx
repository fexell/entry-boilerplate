

import HeaderComponent from "@/components/Header/Header";
import FooterComponent from "@/components/Footer/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <HeaderComponent />
      <main className="min-h-[calc(100vh-57px-73px)] bg-neutral-900">
        <div className="flex flex-col lg:max-w-5xl md:max-w-4xl max-md:max-w-full max-md:px-8 h-full mx-auto">
          {children}
        </div>
      </main>
      <FooterComponent />
    </>
  );
}
