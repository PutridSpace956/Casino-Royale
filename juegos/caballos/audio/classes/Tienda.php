<?php

require_once __DIR__ . '/Producto.php';

class Tienda
{
    private string $nombre;
    private array $productos;

    public function __construct(string $nombre)
    {
        $this->nombre = $nombre;
        $this->productos = [];
    }

    public function getNombre(): string {return $this->nombre;}

    public function agregarProducto(Producto $producto): void {$this->productos[] = $producto;}

    public function getProductos(): array {return $this->productos;}

    public function getValorTotalStock(): float
    {
        $total = 0;
        foreach ($this->productos as $prod) {
            $total += $prod->getValorStock();
        }
        return $total;
    }
}
?>