"use client";

import { use, useEffect } from "react";
import { Crisp } from "crisp-sdk-web";
import { UserIncluded } from "~/server/api/routers/user";

type CrispProps = {
  user: UserIncluded;
  crispToken: string;
  onClose: () => void;
};

const CrispChat = (props: CrispProps) => {
  const { user, onClose, crispToken } = props;
  useEffect(() => {
    if (crispToken) {
      Crisp.configure(crispToken, {
        autoload: false,
      });
      Crisp.setTokenId(`cje-token-crisp-${user.id.toString()}`);
      if (user.firstName && user.lastName)
        Crisp.user.setNickname(`${user.firstName} ${user.lastName}`);
      if (user.userEmail) Crisp.user.setEmail(`${user.userEmail}`);
      if (user.status_image) {
        Crisp.session.setData({
          hasCjePass: user.status_image === "approved",
        });
      }

      // NEED DOMAIN NAME TO SET AVATAR => TODO LATER
      // if (user.status_image === 'approved' && user.image && user.image.url) {
      // 	Crisp.user.setAvatar(user.image.url)
      // }

      Crisp.chat.open();
      Crisp.chat.show();
      Crisp.chat.onChatClosed(() => {
        Crisp.chat.hide();
        onClose();
      });
    }
  });

  return null;
};

export default CrispChat;
