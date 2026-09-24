import { Navigate, useParams } from "react-router-dom";

// Old single-story links now open in the theatre.
export default function Story() {
  const { id } = useParams();
  return <Navigate to={`/watch/${id}`} replace />;
}
