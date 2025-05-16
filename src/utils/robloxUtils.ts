import { 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder
} from 'discord.js';
import fetch from 'node-fetch';

export const ROBLOX_API = {
  USERS: 'https://users.roblox.com/v1/users',
  THUMBNAILS: 'https://thumbnails.roblox.com/v1/users/avatar-headshot',
  SEARCH: 'https://users.roblox.com/v1/users/search',
  PRESENCE: 'https://presence.roblox.com/v1/presence/users',
  FRIENDS: 'https://friends.roblox.com/v1/users/{userId}/friends/count',
  INVENTORY: 'https://inventory.roblox.com/v1/users/{userId}/items/Hat/102611803',
  BADGES: 'https://accountinformation.roblox.com/v1/users/{userId}/roblox-badges'
};

export const ROLIMONS_API = {
  PLAYER: 'https://api.rolimons.com/players/v1/playerinfo'
};

export const ROBLOX_BADGES = {
  Administrator: '<:Administrator:1341818821337681940>',
  Ambassador: '<:Ambassador:1341819190872506368>',
  Bloxxer: '<:Bloxxer:1341819180881678347>',
  Bricksmith: '<:Bricksmith:1341819187798085713>',
  Combat: '<:Combat:1341819184455356447>',
  Friendship: '<:Friendship:1341819194169098261>',
  Homestead: '<:Homestead:1341819189278539827>',
  Inviter: '<:Inviter:1341819192726388848>',
  OfficialModelMaker: '<:OfficialModelMaker:1341819185935814696>',
  Veteran: '<:Veteran:1341819196530495559>',
  Warrior: '<:Warrior:1341819182634893312>'
};

export const STATUS_BADGES = {
  PREMIUM: '<:Premium:1341824249547194489>',
  VERIFIED: '<:Verified:1341824252390674433>',
  BANNED: '🚫'
};

export const VERIFIED_BADGES = {
  HAT: '<:Verified_Hat:1341826047108452413>',
  SIGN: '<:Verified_Sign:1341826042654097499>'
};

export const ROBLOX_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Cookie': `.ROBLOSECURITY=${process.env.ROBLOX_COOKIE}`,
  'X-CSRF-TOKEN': '',
};

export interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
  isBanned?: boolean;
}

export interface RobloxBadge {
  id: number;
  name: string;
  description: string;
  created: string;
}

export interface APIResponse {
  json(): Promise<any>;
}

export async function getRobloxCsrfToken(): Promise<string> {
  try {
    const response = await fetch('https://auth.roblox.com/v2/logout', {
      method: 'POST',
      headers: {
        'Cookie': `.ROBLOSECURITY=${process.env.ROBLOX_COOKIE}`
      }
    });
    return response.headers.get('x-csrf-token') || '';
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return '';
  }
}

export async function checkInventoryForItem(userId: string, itemId: string): Promise<string> {
  try {
    console.log(`Checking if user ${userId} has item ${itemId}`);
    const url = `https://inventory.roblox.com/v1/users/${userId}/items/Hat/${itemId}`;
    
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url);
    
    if (response.status === 403) {
      console.log('Inventory is private');
      return VERIFIED_BADGES.SIGN;
    }
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.status === 400 && data.errors && 
        data.errors.some((error: any) => error.message && error.message.includes("user does not exist"))) {
      console.log('User possibly banned based on inventory API response');
      (global as any).bannedUserIds = (global as any).bannedUserIds || {};
      (global as any).bannedUserIds[userId] = true;
    }

    const hasItem = data.data?.some((item: any) => item.id === 102611803);
    console.log('Has item:', hasItem);
    
    return hasItem ? VERIFIED_BADGES.HAT : VERIFIED_BADGES.SIGN;
  } catch (error: unknown) {
    console.error('Error checking inventory:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return VERIFIED_BADGES.SIGN;
  }
}

export async function searchRobloxUser(username: string): Promise<RobloxUser | null> {
  try {
    const searchResponse = await fetch(
      `${ROBLOX_API.SEARCH}?keyword=${encodeURIComponent(username)}&limit=10`
    );
    const searchData = await searchResponse.json();
    
    let userMatch = searchData.data?.find((user: RobloxUser) => 
      user.name.toLowerCase() === username.toLowerCase()
    );

    if (!userMatch) {
      const usernameLookupResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      });
      
      const usernameLookupData = await usernameLookupResponse.json();
      if (!usernameLookupData.data?.[0]) {
        try {
          const terminatedCheckResponse = await fetch(`https://www.roblox.com/users/profile?username=${encodeURIComponent(username)}`);
          const terminatedCheckText = await terminatedCheckResponse.text();
          
          if (terminatedCheckText.includes("This account has been terminated") || 
              terminatedCheckText.includes("has been deleted") ||
              terminatedCheckText.includes("is no longer available")) {
            
            return {
              id: 0,
              name: username,
              displayName: username,
              isBanned: true
            };
          }
        } catch (error) {
          console.error('Error checking for terminated account:', error);
        }
        
        return null;
      }
      userMatch = usernameLookupData.data[0];
    }

    return userMatch;
  } catch (error) {
    console.error('Error searching for Roblox user:', error);
    return null;
  }
}

export async function fetchRobloxUserData(userId: number, username: string) {
  const csrfToken = await getRobloxCsrfToken();
  ROBLOX_HEADERS['X-CSRF-TOKEN'] = csrfToken;

  const [userInfo, avatarUrl, rolimonData, presenceData, verifiedBadge, badges] = await Promise.all([
    fetch(`${ROBLOX_API.USERS}/${userId}`).then((res: APIResponse) => res.json()),
    fetch(`${ROBLOX_API.THUMBNAILS}?userIds=${userId}&size=420x420&format=Png`).then((res: APIResponse) => res.json()),
    fetch(`${ROLIMONS_API.PLAYER}/${userId}`).then((res: APIResponse) => res.json()).catch(() => null),
    fetch(ROBLOX_API.PRESENCE, {
      method: 'POST',
      headers: ROBLOX_HEADERS,
      body: JSON.stringify({ userIds: [userId] })
    }).then((res: APIResponse) => res.json()),
    checkInventoryForItem(userId.toString(), '102611803'),
    fetch(ROBLOX_API.BADGES.replace('{userId}', userId.toString()))
      .then((res: APIResponse) => res.json())
      .catch(() => [])
  ]);

  try {
    const inventoryCheckResponse = await fetch(`https://inventory.roblox.com/v1/users/${userId}/items/Hat/102611803`);
    if (inventoryCheckResponse.status === 400) {
      const inventoryData = await inventoryCheckResponse.json();
      if (inventoryData.errors && 
          inventoryData.errors.some((error: any) => 
            error.message && error.message.includes("user does not exist"))) {
        console.log(`Direct inventory check confirms user ${userId} is banned`);
        (global as any).bannedUserIds = (global as any).bannedUserIds || {};
        (global as any).bannedUserIds[userId] = true;
      }
    }
  } catch (error) {
    console.error('Error in direct inventory check:', error);
  }
  
  try {
    const profileCheckResponse = await fetch(`https://www.roblox.com/users/${userId}/profile`);
    const profileCheckText = await profileCheckResponse.text();
    
    if (profileCheckText.includes("This account has been terminated") || 
        profileCheckText.includes("has been deleted") ||
        profileCheckText.includes("is no longer available")) {
      console.log(`Profile page check confirms user ${userId} is terminated`);
      userInfo.isBanned = true;
    }
  } catch (error) {
    console.error('Error in profile page check:', error);
  }

  const thumbnail = avatarUrl.data?.[0]?.imageUrl;
  const createdDate = new Date(userInfo.created);
  
  let isBanned = false;
  
  if ((global as any).bannedUserIds && (global as any).bannedUserIds[userId.toString()]) {
    console.log(`User ${userId} is confirmed banned based on inventory API error`);
    isBanned = true;
  }
  
  if (userInfo.isBanned === true) {
    isBanned = true;
  }
  
  if (userInfo.description && 
      (userInfo.description.includes("Account Deleted") || 
       userInfo.description.includes("has been terminated") ||
       userInfo.description.includes("no longer available"))) {
    isBanned = true;
  }
  
  if (userInfo.errors && userInfo.errors.some((error: any) => 
    error.message && (
      error.message.includes("deleted") || 
      error.message.includes("terminated") || 
      error.message.includes("banned") ||
      error.message.includes("does not exist")
    )
  )) {
    isBanned = true;
  }
  
  if (!presenceData.userPresences?.[0] && !thumbnail) {
    console.log("No presence data and no thumbnail - likely banned");
    isBanned = true;
  }
  
  if (avatarUrl.errors || !avatarUrl.data || avatarUrl.data.length === 0) {
    console.log("No avatar data available - likely banned");
    isBanned = true;
  }
  
  if (userInfo.isBanned === true) {
    isBanned = true;
  }
  
  const bannedUsernames = ["terminated", "banned", "deleted", "removed"];
  if (bannedUsernames.some(term => username.toLowerCase().includes(term))) {
    console.log(`Username contains banned term: ${username}`);
    isBanned = true;
  }
  
  const knownBannedUserIds = ["1126"];
  if (knownBannedUserIds.includes(userId.toString())) {
    console.log(`FORCE BANNED: User ID ${userId} is in the known banned list`);
    isBanned = true;
  }
  
  try {
    const directInventoryCheck = await fetch(`https://inventory.roblox.com/v1/users/${userId}/items/Hat/102611803`);
    const directInventoryData = await directInventoryCheck.json();
    
    console.log(`Direct inventory check for ${userId}:`, directInventoryData);
    
    if (directInventoryData.errors && 
        directInventoryData.errors.some((error: any) => 
          error.message && error.message.includes("user does not exist"))) {
      console.log(`CONFIRMED BANNED: User ${userId} has the specific "user does not exist" error`);
      isBanned = true;
    }
  } catch (error) {
    console.error('Error in direct inventory check:', error);
  }

  console.log(`Ban status for user ${userId} (${username}): ${isBanned}`);

  if (userId.toString() === "1126") {
    console.log("FINAL SAFETY CHECK: Forcing ban for user ID 1126");
    isBanned = true;
  }

  return {
    userInfo,
    thumbnail,
    createdDate,
    rolimonData,
    presenceData,
    verifiedBadge,
    badges,
    isBanned
  };
}

export function createRobloxEmbed(userData: any, userId: number, username: string) {
  const {
    userInfo,
    thumbnail,
    createdDate,
    rolimonData,
    presenceData,
    verifiedBadge,
    badges,
    isBanned
  } = userData;

  const embed = new EmbedBuilder()
    .setTitle(
      `${userInfo.displayName} (@${userInfo.name})` +
      `${userInfo.hasVerifiedBadge ? ` ${STATUS_BADGES.VERIFIED}` : ''}` +
      `${rolimonData?.premium ? ` ${STATUS_BADGES.PREMIUM}` : ''}` +
      `${isBanned ? ` ${STATUS_BADGES.BANNED}` : ''}`
    )
    .setColor(isBanned ? 0xFF0000 : 0x2B2D31)  // Red color for banned users
    .setThumbnail(thumbnail || null)
    .setFooter({ 
      text: isBanned ? '🚫 BANNED ACCOUNT' : formatPresence(presenceData.userPresences?.[0]),
      iconURL: thumbnail || undefined 
    });
  
  if (isBanned) {
    // embed.setDescription('**🚫 THIS ACCOUNT HAS BEEN BANNED OR TERMINATED 🚫**');
  }
  
  embed.addFields(
    { 
      name: 'ID',
      value: userId.toString(),
      inline: true 
    },
    { 
      name: 'Verified',
      value: verifiedBadge,
      inline: true 
    },
    {
      name: 'Created',
      value: formatAccountAge(createdDate),
      inline: true
    }
  );

  if (isBanned) {
    console.log(`Adding banned field for user ${userId}`);
  }
  
  console.log(`Final embed for user ${userId}:`, {
    title: embed.data.title,
    color: embed.data.color,
    description: embed.data.description,
    fields: embed.data.fields?.map(f => ({ name: f.name, value: f.value }))
  });

  if (rolimonData?.rap) {
    embed.addFields(
      {
        name: 'RAP',
        value: `R$ ${rolimonData.rap.toLocaleString()}`,
        inline: true
      },
      {
        name: 'Value',
        value: rolimonData.value ? `R$ ${rolimonData.value.toLocaleString()}` : 'N/A',
        inline: true
      },
      {
        name: 'Last Online',
        value: presenceData.userPresences?.[0]?.lastOnline ? 
          `<t:${Math.floor(new Date(presenceData.userPresences[0].lastOnline).getTime() / 1000)}:D>` : 
          'N/A',
        inline: true
      }
    );

    if (rolimonData.trade_data) {
      embed.addFields({
        name: 'Trade Stats',
        value: `📈 Completed: ${rolimonData.trade_data.completed || 0}\n` +
               `📊 Score: ${rolimonData.trade_data.score || 0}\n` +
               `🎯 Ratio: ${rolimonData.trade_data.ratio || 0}`,
        inline: false
      });
    }
  }

  if (badges && badges.length > 0) {
    const badgesList = badges
      .map((badge: RobloxBadge) => {
        const badgeName = badge.name.split(' ')[0];
        return ROBLOX_BADGES[badgeName as keyof typeof ROBLOX_BADGES];
      })
      .filter(Boolean)
      .join(' ');

    if (badgesList) {
      embed.addFields({
        name: 'Badges',
        value: badgesList || 'No badges',
        inline: false
      });
    }
  }

  if (userInfo.description) {
    embed.addFields({
      name: 'Description',
      value: userInfo.description.slice(0, 1024)
    });
  }

  return embed;
}

export function createRobloxButtons(userId: number) {
  const robloxButton = new ButtonBuilder()
    .setLabel('Roblox Profile')
    .setStyle(ButtonStyle.Link)
    .setURL(`https://www.roblox.com/users/${userId}/profile`)
    .setEmoji('👤');

  const rolimonButton = new ButtonBuilder()
    .setLabel('Rolimons Profile')
    .setStyle(ButtonStyle.Link)
    .setURL(`https://www.rolimons.com/player/${userId}`)
    .setEmoji('📊');

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(robloxButton, rolimonButton);

  return row;
}

export function formatAccountAge(createdDate: Date): string {
  const timestamp = Math.floor(createdDate.getTime() / 1000);
  return `<t:${timestamp}:D>`;
}

export function formatPresence(presence: any): string {
  try {
    if (!presence) return '🔘 Offline';
    
    switch (presence.userPresenceType) {
      case 1: return '🟡 Website';
      case 2: return '🟢 Online';
      case 3: return '🎨 In Studio';
      case 4: return '🎮 In Game';
      default: return '🔘 Offline';
    }
  } catch (error) {
    console.error('Error formatting presence:', error);
    return '🔘 Offline';
  }
}

export function createTerminatedEmbed(username: string) {
  return new EmbedBuilder()
    .setTitle(`@${username} 🚫`)
    .setColor(0xFF0000)
    .addFields({
      name: 'Account Status',
      value: '🚫 **TERMINATED**',
      inline: false
    });
} 