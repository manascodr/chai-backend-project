import { useParams } from "react-router-dom";
import ChannelHeader from "../components/ChannelHeader";
import ChannelVideos from "../components/ChannelVideos";

const ChannelPage = () => {
  const { username } = useParams();
  return (
    <>
      <ChannelHeader  />
      <ChannelVideos  />
    </>
  );
};

export default ChannelPage;
