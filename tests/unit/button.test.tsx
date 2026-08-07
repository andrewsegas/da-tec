import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renderiza o texto do botão", () => {
    render(<Button>Votar</Button>);
    expect(
      screen.getByRole("button", { name: "Votar" }),
    ).toBeInTheDocument();
  });

  it("aplica a variante ao usar asChild em um link", () => {
    render(
      <Button asChild variant="outline">
        <a href="#exemplo">Enquetes</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Enquetes" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass("border");
  });
});
