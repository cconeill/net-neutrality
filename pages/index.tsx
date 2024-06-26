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

  const updateTheme = useMutation(({ storage }, theme: "light" | "dark", name: "Yes, we do." | "No, we don't.") => {
    storage.get("logo").set("theme", theme);
    storage.get("logo").set("name", name);
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
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <h2 className={styles.heading}>Do we have Net Neutrality?</h2>
            <div className={styles.form_group}>

              <div className={styles.form_group_grid}>
                <div className={styles.selection_container}>
                  <button
                    id="button-theme-light"
                    className={
                      theme === "light"
                        ? styles.button_theme_selected
                        : styles.button_theme
                    }
                    onClick={() => updateTheme("light", "Yes, we do.")}
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
                    className={
                      theme === "dark"
                        ? styles.button_theme_selected
                        : styles.button_theme
                    }
                    onClick={() => updateTheme("dark", "No, we don't.")}
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
          <a className={styles.fcc_link} href="https://www.fcc.gov/news-events/headlines">https://www.fcc.gov/news-events/headlines</a>
 
        </div>
        
      </div>
      <div className={styles.footer}>
        <div>Source code <a className={styles.link} href="https://github.com/cconeill/net-neutrality">cconeill/net-neutrality</a> 👨‍💻</div>
        <div>Made with <a className={styles.link} href="https://liveblocks.io/">Liveblocks</a> 🙌</div>
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
