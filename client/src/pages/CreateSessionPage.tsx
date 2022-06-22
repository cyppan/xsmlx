import { trpc } from "../App";
import Button from "../ui/Button";
import Header from "../ui/Header";
import Toolbar from "../ui/Toolbar";

export default function CreateSessionPage({ user }: { user: string }) {
  const createSessionMutation = trpc.useMutation('create');
  return (
    <>
      <Header left={'poker planning'} right={user} />
      <Toolbar>
        <Button
          handleClick={() => {
            createSessionMutation.mutate(
              {
                user,
              },
              {
                onSuccess: (sessionId) => {
                  window.location.hash = sessionId;
                  window.location.reload();
                },
              }
            );
          }}
        >
          Create a new session
        </Button>
      </Toolbar>
    </>
  );
}