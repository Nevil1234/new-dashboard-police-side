export const COMETCHAT_CONSTANTS = {
    APP_ID: process.env.APP_ID,
    REGION: process.env.REGION_CODE,
    AUTH_KEY: process.env.YOUR_AUTH_KEY,
    UID_PREFIX: {
      OFFICER: "OFFICER_",
      COMPLAINANT: "USER_"
    }
  };
  
  export const initializeCometChat = async () => {
    const { CometChat } = await import("@cometchat-pro/chat");
    const appID = COMETCHAT_CONSTANTS.APP_ID;
    const region = COMETCHAT_CONSTANTS.REGION;
    
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();
  
    await CometChat.init(appID, appSetting).initialize();
    return CometChat;
  };
  