import { Layout } from "antd";

const { Footer } = Layout;

export const AppFooter = () => {
    return (
        <Footer style={{ textAlign: "center" }} className="text-gray-500">
            LMS System ©{new Date().getFullYear()} Created by Tan Phat with assistance from Gemini
        </Footer>
    );
};