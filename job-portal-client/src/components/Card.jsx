import {
  FiBriefcase,
  FiHome,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMapPin,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const Card = ({ data }) => {
  // console.log(data);
  const {
    _id,
    jobTitle,
    companyName,
    jobLocation,
    employmentType,
    minPrice,
    maxPrice,
    postingDate,
    description,
  } = data;
  return (
    <div>
      <section className="card">
        <Link
          to={`/jobs/${_id}`}
          className="flex gap-4 flex-col sm:flex-row items-start"
        >
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue to-violet-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FiBriefcase className="text-2xl" />
          </div>

          <div className="card-details flex-1">
            <h4 className="text-primary mb-1 flex items-center gap-2 font-medium">
              <FiHome className="text-blue" />
              {companyName}
            </h4>
            <h3 className="text-lg font-semibold mb-2">{jobTitle}</h3>

            <div className="text-primary/70 text-base flex flex-wrap gap-2 mb-2">
              <span className="flex items-center gap-2">
                <FiMapPin /> {jobLocation}
              </span>
              <span className="flex items-center gap-2">
                <FiClock /> {employmentType}
              </span>
              <span className="flex items-center gap-2">
                <FiDollarSign /> {minPrice}-{maxPrice}k
              </span>
              <span className="flex items-center gap-2">
                <FiCalendar /> {postingDate}
              </span>
            </div>

            <p className="text-base text-primary/70 leading-7 line-clamp-3">
              {description}
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
};

export default Card;
