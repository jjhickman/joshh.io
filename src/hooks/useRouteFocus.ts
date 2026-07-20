import { useEffect, type RefObject } from "react";
import { NavigationType, useLocation, useNavigationType } from "react-router";

export function useRouteFocus(mainRef: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    if (navigationType !== NavigationType.Pop) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [mainRef, navigationType, pathname]);
}
