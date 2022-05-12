import app from "../app";

it("works", () => {
  console.log(app);
  expect(1 + 1).toBe(2);
});

it("doesn't work", () => {
  expect(1 + 1).toBe(2);
});
