import { useUserStore } from "@/stores/userStore";

export default function MePage() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <div>You didnt log in yet!</div>;
  }

  return (
    <div>
      <h1>Hello, {user.name}</h1>
      <div>{user.email}</div>
      <div>{user.phone}</div>
      <div>{user.street}</div>
    </div>
  );
}
