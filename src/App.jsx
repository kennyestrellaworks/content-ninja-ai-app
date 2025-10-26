import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { ArticleCreate } from "./pages/ArticleCreate";
import { ImageCreate } from "./pages/ImageCreate";
import { VideoCreate } from "./pages/VideoCreate";
import { Home } from "./pages/Home";

export const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index="/" element={<Home />} />
        <Route path="article-create" element={<ArticleCreate />} />
        <Route path="image-create" element={<ImageCreate />} />
        <Route path="video-create" element={<VideoCreate />} />
      </Route>
    )
  );
  return <RouterProvider router={router} />;
};
