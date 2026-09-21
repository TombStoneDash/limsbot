import { describe, expect, it } from "vitest";
import { estimateFromExcerpt, estimateReadingTime } from "../src/lib/blog-reading-time";

describe("blog reading time", () => {
  it("reads 200 words in one minute at the default rate", () => {
    expect(estimateReadingTime(Array(200).fill("word").join(" "))).toEqual({
      minutes: 1,
      label: "1 min read",
    });
  });

  it.each(["", " \t\n\r "])("returns zero for empty or whitespace-only text %j", (text) => {
    expect(estimateReadingTime(text)).toEqual({ minutes: 0, label: "0 min read" });
  });

  it("rounds a short non-empty text up to one minute", () => {
    expect(estimateReadingTime("hello")).toEqual({ minutes: 1, label: "1 min read" });
  });

  it.each([
    [201, 2],
    [400, 2],
    [401, 3],
    [600, 3],
    [601, 4],
  ])("rounds %i words up to %i minutes", (wordCount, minutes) => {
    expect(estimateReadingTime(Array(wordCount).fill("word").join(" "))).toEqual({
      minutes,
      label: `${minutes} min read`,
    });
  });

  it("counts non-empty whitespace-separated tokens and accepts a custom rate", () => {
    expect(estimateReadingTime("  one\ttwo\nthree\r\nfour  five  ", 2)).toEqual({
      minutes: 3,
      label: "3 min read",
    });
  });

  it("estimates only the supplied excerpt using the default rate", () => {
    const excerpt = Array(201).fill("word").join(" ");
    expect(estimateFromExcerpt(excerpt)).toEqual({ minutes: 2, label: "2 min read" });
    expect(estimateFromExcerpt("")).toEqual({ minutes: 0, label: "0 min read" });
  });
});
