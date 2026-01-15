import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  if (!video) return null;

  const {
    _id,
    title = "Untitled video",
    thumbnail,
    views,
    owner = {},
  } = video;

  const ownerName = owner.fullname || owner.username || "Unknown creator";
  const ownerAvatar = owner.avatar;

  return (
    <div className="video-card" role="button" tabIndex={0}>
      <Link to={`/watch/${_id}`} className="video-card__link">
        {/* Thumbnail wrapper */}
        <div className="video-card__thumb">
          <img src={thumbnail} alt={title} loading="lazy" />
        </div>

        {/* Title */}
        <h4 className="video-card__title">{title}</h4>
      </Link>
      {/* Owner */}
      <Link
        to={`/c/${owner.username}`}
        className="video-card__owner-link"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="video-card__owner">
          {ownerAvatar ? (
            <img
              className="video-card__avatar"
              src={ownerAvatar}
              alt={ownerName}
              loading="lazy"
            />
          ) : (
            <div className="video-card__avatar video-card__avatar--placeholder" />
          )}

          <span className="video-card__owner-name">{ownerName}</span>
          <div>{views} views</div>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;
