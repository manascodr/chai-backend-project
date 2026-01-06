import { useNavigate } from 'react-router-dom';

const VideoCard = ({video}) => {
  
  const navigate = useNavigate();

  const { title,thumbnail } = video;

  return (
    <div
      className="video-card"
      onClick={()=> navigate(`/watch/${video._id}`)}
    >
      <h4>{title}</h4>
      <img src={thumbnail} alt={"Video thumbnail"} />
    </div>
  );
};

export default VideoCard;
