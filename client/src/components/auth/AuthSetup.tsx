import { Outlet} from "react-router-dom"

import { useGetCurrentUserQuery } from "../../redux/api/userAPI"
import Spinner from "../utils/Spinner"
import Error from "../utils/Error"
import { CustomSerializedError } from "../../types/CustomSerializedError"

const AuthSetup = () => {
  const {isLoading: isUserLoading, isError: isUserError, error: userError} = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('accessToken')
  })


  if(isUserLoading)
    return <Spinner />
    
  if(isUserError){
    const error = userError as CustomSerializedError
  
    return <Error error={error} />

  }
  return (
    <>
        <Outlet />
    </>
  )
}

export default AuthSetup