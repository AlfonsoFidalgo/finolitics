import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GreatesRecentPosts from "@/components/greatestRecentPosts";
// import "@testing-library/jest-dom";

describe("GreatesRecentPosts", () => {
  it("renders correctly", () => {
    render(<GreatesRecentPosts latestPosts={[]} threads={[]} finoliers={[]} />);
    const title = screen.getByText("Últimos comentarios destacados");
    expect(title).toBeDefined();
  });

  it("renders posts correctly", () => {
    const mockedPosts = [
      {
        id: "1",
        finolierId: "finolier1",
        createdAt: new Date(),
        threadId: "thread1",
        message: "This is a test post",
        likes: 10,
        dislikes: 2,
      },
      {
        id: "2",
        finolierId: "finolier2",
        createdAt: new Date(),
        threadId: "thread2",
        message: "This is another test post",
        likes: 5,
        dislikes: 1,
      },
    ];

    const mockedThreads = [
      {
        id: "thread1",
        title: "Test Thread 1",
        link: "https://example.com/thread1",
        createdAt: new Date(),
      },
      {
        id: "thread2",
        title: "Test Thread 2",
        link: "https://example.com/thread2",
        createdAt: new Date(),
      },
    ];

    render(
      <GreatesRecentPosts
        latestPosts={mockedPosts}
        threads={mockedThreads}
        finoliers={[]}
      />
    );
    screen.debug(); // This will log the rendered output to the console
    const post1 = screen.getByText("This is a test post");
    expect(post1).toBeDefined();
  });
});

export interface Thread {
  id: string;
  title: string;
  link: string;
  createdAt: Date;
}
