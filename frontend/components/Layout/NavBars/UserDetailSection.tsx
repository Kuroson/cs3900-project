import { UserDetails, getRoleText } from "models/user.model";
import { CLIENT_BACKEND_URL } from "util/api/api";

/**
 * User avatar
 */
const UserDetailsSection = ({ first_name, last_name, role, avatar }: UserDetails): JSX.Element => {
  return (
    <div className="mt-5 flex flex-row justify-center">
      <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
        <img
          src={`${CLIENT_BACKEND_URL}/public/avatars/${
            avatar?.length !== 0 ? avatar : "missy"
          }.svg`}
          className="h-[50px] w-[50px] rounded-full"
          alt=""
        />
        {/* <span className="text-2xl font-bold">
          {(first_name?.charAt(0) ?? "") + (last_name?.charAt(0) ?? "")}
        </span> */}
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full">{`${first_name} ${last_name}`}</span>
        <span className="text-start w-full" id="userRole">
          {getRoleText(role)}
        </span>
      </div>
    </div>
  );
};

export default UserDetailsSection;
