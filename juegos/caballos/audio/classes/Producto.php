<?php

class Producto
{
    private string $nombre;
    private string $sku;
    private float $precio;
    private int $stock;
    private ?string $rutaImagen;

    public function __construct(string $nombre, string $sku, float $precio, int $stock, ?string $rutaImagen)
    {
        $this->nombre = $nombre;
        $this->sku = $sku;
        $this->precio = $precio;
        $this->stock = $stock;
        $this->rutaImagen = $rutaImagen;
    }

    public function getNombre(): string {return $this->nombre;}

    public function getSku(): string {return $this->sku;}

    public function getPrecio(): float {return $this->precio;}

    public function getStock(): int {return $this->stock;}

    public function getRutaImagen(): ?string {return $this->rutaImagen;}

    public function getValorStock(): float
    {
        return $this->precio * $this->stock;
    }

    public function añadirStock(int $cantidad): void
    {
        if ($cantidad > 0) {
            $this->stock += $cantidad;
        }
    }

    public function reducirStock(int $cantidad): void
    {
        if ($cantidad > 0 && ($this->stock - $cantidad) >= 0) {
            $this->stock -= $cantidad;
        }
    }
}
?>