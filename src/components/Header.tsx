// import * as React from "react";
import { NavLink } from "react-router-dom";
import { Button, Flex } from "@aws-amplify/ui-react";
// import { ThemeContext } from "./ThemeProvider";
// import { LuMoon, LuSun } from "react-icons/lu";
import { signOut, getCurrentUser } from 'aws-amplify/auth';
// import { Logo } from "./Logo";
const mainLogo = '/datavail-logo.svg';
import { useLocation } from 'react-router-dom';

import { defineComponentTheme } from "@aws-amplify/ui-react/server";
export const navLinkTheme = defineComponentTheme({
  name: "nav-link",
  theme(tokens) {
    return {
      textDecoration: "none",
      cursor: "pointer",
      display: "flex",
      color: tokens.colors.font.primary,
      ":hover": {
        color: tokens.colors.font.interactive,
      },
      ":active": {
        color: tokens.colors.font.active,
      },
      _modifiers: {
        active: {
          backgroundColor: tokens.colors.background.info,
        },
      },
    };
  },
});

export const Header = () => {
  // const { colorMode, setColorMode } = React.useContext(ThemeContext);
  const location = useLocation();
  const headerClass = (location.pathname === '/' || location.pathname === '/recipe-generator') 
    ? 'header' 
    : 'header chat-header';

  return (
    <Flex
      direction="row"
      width="100vw"
      padding="small"
      // backgroundColor="background.secondary"
     className={headerClass}
      
    >
       
      <Flex direction="row" gap="small" color="font.primary">
        <img  src={mainLogo} alt="fireSpot" className="logo"/>
        {/* <Logo width="2rem" height="2rem" /> */}
        {/* <Button
          onClick={() => setColorMode(colorMode === "light" ? "dark" : "light")}
        >
          {colorMode === "light" ? <LuMoon /> : <LuSun />}
        </Button> */}
        
      </Flex>
      <Flex direction="row" className="top-link-web">
      <NavLink
        className={({ isActive }) =>
          navLinkTheme.className({ _modifiers: { active: isActive } })
        }
        to="/chat"
      >
        Chat
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          navLinkTheme.className({ _modifiers: { active: isActive } })
        }
        to="/recipe-generator"
      >
        Recipe generator
      </NavLink>
      {/* <Link to="story-generator" state={{ story: "cats", title: "aristocats" }}>
        Test
      </Link> */}
      </Flex>
      <Button
          onClick={() => {
            signOut();
          }}
        >
          Log out
        </Button>
    </Flex>
  );
};
