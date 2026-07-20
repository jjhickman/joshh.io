import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpotifyEmbed } from "../components/media/SpotifyEmbed";
import { YouTubeEmbed } from "../components/media/YouTubeEmbed";
import { releases } from "../content/releases";
import type { Video } from "../content/types";
import { videos } from "../content/videos";

describe("privacy-preserving media", () => {
  it("does not create a Spotify iframe before activation", () => {
    const { container } = render(<SpotifyEmbed release={releases[0]!} />);
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open feathers on spotify/i })).toHaveAttribute("href", "https://open.spotify.com/album/6UfhFkIHodlG0kNF8I1TXC");
    const expectedIframeError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole("button", { name: /load spotify player/i }));
    expect(screen.getByTitle(/listen to feathers/i)).toHaveAttribute("loading", "lazy");
    expectedIframeError.mockRestore();
  });

  it("permanently blocks placeholder YouTube iframe creation", () => {
    const { container } = render(<YouTubeEmbed video={videos[0]!} />);
    const button = screen.getByRole("button", { name: /video coming soon/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.getByText(/poster preview/i)).toBeInTheDocument();
  });

  it("uses youtube-nocookie only after activating a real id", () => {
    const realVideo: Video = {
      ...videos[0]!,
      id: "test-video",
      youtubeId: "abc123",
      title: "Test film",
    };
    const { container } = render(<YouTubeEmbed video={realVideo} />);
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    const expectedIframeError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole("button", { name: /load video/i }));
    expect(screen.getByTitle("Watch Test film")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abc123");
    expectedIframeError.mockRestore();
  });
});
