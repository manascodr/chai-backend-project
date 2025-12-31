import { useEffect, useState } from "react";
import Login from "./pages/Login";
import { getCurrentUser } from "./api/auth.api";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(user);
  

  // check if already logged in (on refresh)
  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false)); // .finally is called regardless of success or failure
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Login setUser={setUser} />;

  return (
    <>
      <div>Welcome, {user.username}!</div>
    </>
  );
};

export default App;
