import { SlashCommandMessage } from "@fire/lib/extensions/slashCommandMessage";
import { DiscordAPIError, MessageEmbed } from "discord.js";
import { FireMessage } from "@fire/lib/extensions/message";
import { Language } from "@fire/lib/util/language";
import { Command } from "@fire/lib/util/command";

export default class Ping extends Command {
  constructor() {
    super("ping", {
      description: (language: Language) =>
        language.get("PING_COMMAND_DESCRIPTION"),
      clientPermissions: ["EMBED_LINKS", "SEND_MESSAGES"],
      enableSlashCommand: true,
      restrictTo: "all",
    });
  }

  async exec(message: FireMessage) {
    let pingMessage: FireMessage;
    if (message instanceof FireMessage)
      pingMessage = (await message.send("PING_INITIAL_MESSAGE")) as FireMessage;
    const embed = new MessageEmbed()
      .setTitle(
        `:ping_pong: ${
          message instanceof SlashCommandMessage
            ? this.client.restPing
            : pingMessage.createdTimestamp -
              (message.editedAt
                ? message.editedTimestamp
                : message.createdTimestamp)
        }ms.\n:heartpulse: ${
          this.client.ws.shards.get(message.guild ? message.guild.shardID : 0)
            .ping
        }ms.`
      )
      .setColor(message.member?.displayHexColor || "#ffffff")
      .setFooter(
        message.language.get(
          "PING_FOOTER",
          message.guild ? message.guild.shardID : 0,
          this.client.manager.id
        )
      )
      .setTimestamp();

    return message instanceof SlashCommandMessage
      ? message.channel.send(embed)
      : pingMessage.delete() &&
          (await message.reply(embed).catch((e) => {
            if (
              e instanceof DiscordAPIError &&
              // hacky detection but it works
              e.message.includes("message_reference: Unknown message")
            )
              return message.channel.send(embed);
          }));
  }
}
