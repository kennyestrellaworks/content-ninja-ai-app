import { PageHeading } from "../components/PageHeading";

export const Home = () => {
  return (
    <PageHeading
      h1={"What do you want to generate"}
      p={
        "This app can help you generate an article, image and video. Although the APIs I used are all free tier, you might noticed that there will be some sort of cool time."
      }
    />
  );
};
