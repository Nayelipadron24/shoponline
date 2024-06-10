import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../servicios/productos.service'; 
import { Producto } from '../../interfaces/producto'; 
import { MessageService } from 'primeng/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; 
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  inputValue: string = '';

  productos: Producto[] = [];
  selectedProductos: Producto[] = [];
  productoDialog: boolean = false;
  producto: Producto = {} as Producto;
  submitted: boolean = false;
  productosForm: FormGroup;

  constructor(
    private productoService: ProductoService, 
    private messageService: MessageService,  
    private fb: FormBuilder,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.productosForm = this.fb.group({
      id: [0, Validators.required],
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, Validators.required],
      imagen: [''],
      categoria: ['', Validators.required],
      cantidad: [0, Validators.required],
      estadoInventario: [''],
      rating: [0],
    });
  }

  ngOnInit() {
    this.productoService.getProductos().subscribe(
      data => this.productos = data,
      error => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar productos', life: 3000 })
    );
  }

  openNew() {
    this.producto = {} as Producto;
    this.submitted = false;
    this.productoDialog = true;
    this.productosForm.reset();
  }



  editProducto(producto: Producto) {
    this.producto = { ...producto };
    this.productosForm.patchValue(this.producto);
    this.productoDialog = true;
  }

  deleteProduct(id: number): void {
    this.productoService.deleteProducto(id).subscribe(
      () => {
        this.productos = this.productos.filter(p => p.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'El producto se ha eliminado correctamente'
        });
      },
      error => {
        console.log(error)
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se ha podido eliminar el producto'
        });
      }
    );
  }

  hideDialog() {
    this.productoDialog = false;
    this.submitted = false;
  }

  saveProducto() {
    this.submitted = true;
  
    if (this.productosForm.valid) {
      const productoFormValues = this.productosForm.value;
  
      const producto: Producto = {
        id: productoFormValues.id as number,
        codigo: productoFormValues.codigo as string,
        nombre: productoFormValues.nombre as string,
        descripcion: productoFormValues.descripcion as string,
        precio: productoFormValues.precio as number,
        imagen: productoFormValues.imagen as string,
        categoria: productoFormValues.categoria as string,
        cantidad: productoFormValues.cantidad as number,
        estadoInventario: productoFormValues.estadoInventario as string,
        rating: productoFormValues.rating as number,
      };
  
      if (producto.id && this.findIndexById(producto.id) !== -1) {
        // Actualizar producto existente
        this.productoService.updateProducto(producto.id, producto).subscribe(
          () => {
            const index = this.findIndexById(producto.id);
            this.productos[index] = producto;
            this.productos = [...this.productos]; // Actualizar la lista de productos
            this.productoDialog = false;
            this.producto = {} as Producto;
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto Actualizado', life: 3000 });
          },
          error => {
            console.error('Error al actualizar producto:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar producto', life: 3000 });
          }
        );
      } else {
        // Crear nuevo producto
        this.productoService.createProducto(producto).subscribe(
          nuevoProducto => {
            this.productos.push(nuevoProducto);
            this.productos = [...this.productos]; // Actualizar la lista de productos
            this.productoDialog = false;
            this.producto = {} as Producto;
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto Creado', life: 3000 });
          },
          error => {
            console.error('Error al crear producto:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear producto', life: 3000 });
          }
        );
      }
    } else {
      console.error('El formulario no es válido.');
    }
  }

  findIndexById(id: number): number {
    return this.productos.findIndex(producto => producto.id === id);
  }

  getSeverity(status: string): "success" | "warning" | "danger" | undefined {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return undefined;
    }
  }

  onInputChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    // Implementar la lógica de filtrado global
  }
}
