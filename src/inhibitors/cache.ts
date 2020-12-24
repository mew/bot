import { FireMessage } from "../../lib/extensions/message";
import { Inhibitor } from "../../lib/util/inhibitor";

export default class CacheInhibitor extends Inhibitor {
  constructor() {
    super("cache", {
      reason: "cache",
      priority: 10,
      type: "all",
    });
  }

  async exec(message: FireMessage) {
    // Ensures bot is cached so permission checks 'n' stuff work
    if (!this.client.users.cache.has(this.client.user?.id))
      await this.client.users.fetch(this.client.user.id).catch(() => {});
    if (message.guild)
      await message.guild.members.fetch(this.client.user.id).catch(() => {});
    if (message.guild && message.author?.id && !message.member)
      await message.guild.members.fetch(message?.author).catch(() => {});
    return (
      typeof message.guild.me == "undefined" &&
      typeof message.member == "undefined"
    );
  }
}
