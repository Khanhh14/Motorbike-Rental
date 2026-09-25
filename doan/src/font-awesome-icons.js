import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { faCreditCard } from "@fortawesome/free-regular-svg-icons";
import { 
  faHeadset, 
  faShieldHalved, 
  faMotorcycle, 
  faSackDollar, 
  faWrench, 
  faHandshakeAngle,
  faClock,
  faHeart,
  faLightbulb,
  faCalendarDays,
  faTriangleExclamation,
  faThumbtack,      // Thêm mới
  faHandPointRight  // Thêm mới
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faCreditCard, 
  faHeadset, 
  faShieldHalved, 
  faMotorcycle, 
  faSackDollar, 
  faWrench, 
  faHandshakeAngle,
  faClock,
  faHeart,
  faLightbulb,
  faCalendarDays,
  faTriangleExclamation,
  faThumbtack,
  faHandPointRight
);

export default FontAwesomeIcon;