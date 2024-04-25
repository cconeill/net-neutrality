import {
  useOthers,
  useUpdateMyPresence,
  useOthersMapped,
  useMutation,
  useStorage,
  useSelf,
} from "../liveblocks.config";
import React from "react";
import Avatar from "../components/Avatar";
import Selection from "../components/Selection";
import styles from "./index.module.css";
import { COLORS } from "../constants";

/**
 * This file shows how to create a simple collaborative form.
 *
 * We use the presence block to show the currently focused input to everyone in the room.
 * We use the storage block to persist the state of the form even after everyone leaves the room.
 *
 * The users avatar and name are not set via the `useMyPresence` hook like the cursors.
 * They are set from the authentication endpoint.
 *
 * See pages/api/liveblocks-auth.ts and https://liveblocks.io/docs/api-reference/liveblocks-node#authorize for more information
 */

export default function Example() {
  /**
   * updateMyPresence is used to show the focused input to all the users in the room.
   * It's good way to show to everyone that a user is currently editing a field to avoid potential conflict.
   * For more information: https://liveblocks.io/docs/api-reference/liveblocks-react#useUpdateMyPresence
   */
  const updateMyPresence = useUpdateMyPresence();

  /**
   * useStorage is used to read and stay in sync with the shared state, which
   * all users in the room see. It's using Liveblocks Storage so the data is
   * persisted even after all the users leave the room. For more information:
   * https://liveblocks.io/docs/api-reference/liveblocks-react#useStorage
   */
  const logo = useStorage((root) => root.logo);

  const updateName = useMutation(({ storage }, name: string) => {
    storage.get("logo").set("name", name);
  }, []);

  const updateTheme = useMutation(({ storage }, theme: "light" | "dark") => {
    storage.get("logo").set("theme", theme);
  }, []);

  if (!logo) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <img src="https://liveblocks.io/loading.svg" alt="Loading" />
        </div>
      </div>
    );
  }

  const { theme, name } = logo;
  return (
    <div className={styles.container}>
      <div
        className={
          theme === "light"
            ? styles.preview_container
            : styles.preview_container_dark
        }
      >
        <div className={styles.preview}>{name}</div>
      </div>
      <div className={styles.form_container}>
        <div className={styles.form_content}>
          <Avatars />
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <h2 className={styles.heading}>Do we have Net Neutrality?</h2>
            <div className={styles.form_group}>

              <div className={styles.form_group_grid}>
                <div className={styles.selection_container}>
                  <button
                    id="button-theme-light"
                    value="Yes we do."
                    className={
                      theme === "light"
                        ? styles.button_theme_selected
                        : styles.button_theme
                    }
                    onClick={() => updateTheme("light"), updateName(e.target.value)}
                    onFocus={(e) =>
                      updateMyPresence({ focusedId: e.target.id })
                    }
                    onBlur={() => updateMyPresence({ focusedId: null })}

                  >
                    Yes
                  </button>
                  <Selections id="button-theme-light" />
                </div>
                <div className={styles.selection_container}>
                  <button
                    id="button-theme-dark"
                    value="No we don't."
                    className={
                      theme === "dark"
                        ? styles.button_theme_selected
                        : styles.button_theme
                    }
                    onClick={() => updateTheme("dark"), updateName(e.target.value)}
                    onFocus={(e) =>
                      updateMyPresence({ focusedId: e.target.id })
                    }

                    onBlur={() => updateMyPresence({ focusedId: null })}
                  >
                    No
                  </button>
                  <Selections id="button-theme-dark" />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Selections({ id }: { id: string }) {
  const users = useOthers();
  return (
    <>
      {users.map(({ connectionId, info, presence }) => {
        if (presence.focusedId === id) {
          return (
            <Selection
              key={connectionId}
              name={info.name}
              color={COLORS[connectionId % COLORS.length]}
            />
          );
        }
      })}
    </>
  );
}

const Avatars = React.memo(function Avatars() {
  const me = useSelf((me) => me.info);
  const users = useOthersMapped((others) => others.info);
  return (
    <div className={styles.avatars}>
      {users.slice(0, 3).map(([connectionId, info]) => {
        return (
          <Avatar
            key={connectionId}
            src={info.avatar}
            name={info.name}
            color={COLORS[connectionId % COLORS.length]}
          />
        );
      })}

      {me && <Avatar src={me.avatar} name="You" />}
    </div>
  );
});

export async function getStaticProps() {
  const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY;
  const API_KEY_WARNING = process.env.CODESANDBOX_SSE
    ? `Add your secret key from https://liveblocks.io/dashboard/apikeys as the \`LIVEBLOCKS_SECRET_KEY\` secret in CodeSandbox.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-avatars#codesandbox.`
    : `Create an \`.env.local\` file and add your secret key from https://liveblocks.io/dashboard/apikeys as the \`LIVEBLOCKS_SECRET_KEY\` environment variable.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-avatars#getting-started.`;

  if (!API_KEY) {
    console.warn(API_KEY_WARNING);
  }

  return { props: {} };
}
