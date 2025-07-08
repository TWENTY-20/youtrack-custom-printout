
import PdfContextProvider from "./context/PdfContextProvider.tsx";
import CollapseContextProvider from "./context/CollapseContextProvider.tsx";
import MainView from "./components/MainView.tsx";

export default function App() {

    return (
        <PdfContextProvider>
            <CollapseContextProvider>
                <MainView/>
            </CollapseContextProvider>
        </PdfContextProvider>
    );
}
