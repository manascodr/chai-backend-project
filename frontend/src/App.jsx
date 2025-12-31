import { useEffect, useState } from "react";
import Login from "./pages/Login";
import { getCurrentUser } from "./api/auth.api";
import { useAuthStore } from "./stores/auth.store";

const App = () => {
  const user = useAuthStore((s) => s.user); // get user from store
  const setUser = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState(true);

  // check if already logged in (on refresh)
  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false)); // .finally is called regardless of success or failure
  }, [setUser]);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Login setUser={setUser} />;

  return (
    <>
      <div>Welcome, {user.username}!</div>
    </>
  );
};

export default App;
