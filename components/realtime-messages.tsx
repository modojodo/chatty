import type { Database } from "../db_types";
import { useEffect, useState } from "react";
import { server } from "@ts-morph/common/lib/typescript";
import { useOutletContext } from "@remix-run/react";
import { SupabaseOutletContext } from "~/root";
type Message  = Database["public"]["Tables"]["messages"]["Row"];

export default function RealTimeMessages({serverMessages} : { serverMessages: Message[]}) {
  const [messages, setMessages] = useState(serverMessages);
  const supabase = useOutletContext<SupabaseOutletContext>();

  useEffect(() => {
    setMessages(serverMessages)
  }, [serverMessages]);

  useEffect(() => {
    const channel = supabase
      .channel("*")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as Message;

          if (!messages.find((message) => message.id === newMessage.id)) {
            setMessages([...messages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, messages, setMessages]);
  return(
    <pre>{JSON.stringify(messages, null, 2)}</pre>
  )
}