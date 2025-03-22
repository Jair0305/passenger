"use client"

import { useState, useRef, useEffect, MouseEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ColorPicker } from "@/components/color-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Upload, Plus, Trash2, Move, Copy, ArrowDown, ArrowUp, Layers, Edit, Save, Image, QrCode, Square } from "lucide-react"

// Interfaz para elemento posicionable
export interface PositionableElement {
  id: string;
  type: "text" | "image" | "barcode" | "shape" | "custom";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  styles: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    opacity?: number;
    [key: string]: any;
  };
}

// Props para el editor avanzado
export interface AdvancedPassEditorProps {
  backgroundColor?: string;
  width: number;
  height: number;
  elements: PositionableElement[];
  setElements: (elements: PositionableElement[]) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
}

export function AdvancedPassEditor({
  backgroundColor = "#FFFFFF",
  width,
  height,
  elements,
  setElements,
  selectedElement,
  setSelectedElement
}: AdvancedPassEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartDims, setResizeStartDims] = useState({ width: 0, height: 0 });
  
  // Manejar clic en el lienzo (para deseleccionar elementos)
  const handleCanvasClick = (e: MouseEvent) => {
    // Solo deseleccionar si hacemos clic en el lienzo directamente, no en un elemento
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
    }
  };

  // Iniciar arrastre de un elemento
  const handleDragStart = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (resizing) return; // No iniciar arrastre si estamos redimensionando
    
    // Seleccionar el elemento al comenzar a arrastrarlo
    setSelectedElement(id);
    
    setIsDragging(true);
    
    // Guardar la posición inicial del clic
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Manejar el movimiento durante el arrastre
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStartPos.x;
    const deltaY = currentY - dragStartPos.y;
    
    // Actualizar la posición del elemento seleccionado
    setElements(
      elements.map(el => {
        if (el.id === selectedElement) {
          return {
            ...el,
            x: Math.max(0, Math.min(width - el.width, el.x + deltaX)),
            y: Math.max(0, Math.min(height - el.height, el.y + deltaY))
          };
        }
        return el;
      })
    );
    
    // Actualizar la posición de inicio para el próximo movimiento
    setDragStartPos({
      x: currentX,
      y: currentY
    });
  };

  // Finalizar arrastre
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Iniciar redimensionamiento
  const handleResizeStart = (e: MouseEvent, id: string, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setSelectedElement(id);
    setResizing(true);
    setResizeDirection(direction);
    
    const element = elements.find(el => el.id === id);
    if (element) {
      setResizeStartDims({
        width: element.width,
        height: element.height
      });
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeStartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Manejar movimiento durante redimensionamiento
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing || !selectedElement || !canvasRef.current) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - resizeStartPos.x;
    const deltaY = currentY - resizeStartPos.y;
    
    setElements(
      elements.map(el => {
        if (el.id === selectedElement) {
          let newWidth = el.width;
          let newHeight = el.height;
          let newX = el.x;
          let newY = el.y;
          
          // Ajustar dimensiones según la dirección de redimensionamiento
          if (resizeDirection.includes('e')) {
            newWidth = Math.max(20, resizeStartDims.width + deltaX);
          }
          if (resizeDirection.includes('w')) {
            const widthChange = Math.min(resizeStartDims.width - 20, deltaX);
            newWidth = Math.max(20, resizeStartDims.width - widthChange);
            newX = el.x + widthChange;
          }
          if (resizeDirection.includes('s')) {
            newHeight = Math.max(20, resizeStartDims.height + deltaY);
          }
          if (resizeDirection.includes('n')) {
            const heightChange = Math.min(resizeStartDims.height - 20, deltaY);
            newHeight = Math.max(20, resizeStartDims.height - heightChange);
            newY = el.y + heightChange;
          }
          
          return {
            ...el,
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY
          };
        }
        return el;
      })
    );
  };

  // Finalizar redimensionamiento
  const handleResizeEnd = () => {
    setResizing(false);
    setResizeDirection("");
  };
  
  // Registrar y eliminar los manejadores de eventos globales
  useEffect(() => {
    // Manejador de eventos para el movimiento del ratón
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        handleDragMove(e as unknown as MouseEvent);
      }
      if (resizing) {
        handleResizeMove(e as unknown as MouseEvent);
      }
    };
    
    // Manejador de eventos para la liberación del botón del ratón
    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
      if (resizing) {
        handleResizeEnd();
      }
    };
    
    // Registrar los manejadores de eventos
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Limpiar los manejadores de eventos al desmontar
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, resizing]);
  
  // Función para añadir un elemento posicionable
  const addPositionableElement = (type: "text" | "image" | "barcode" | "shape" | "custom") => {
    const newElement: PositionableElement = {
      id: `element_${Date.now()}`,
      type,
      content: type === "text" ? "Texto personalizable" : "",
      x: Math.floor(width / 2) - 50,
      y: Math.floor(height / 2) - 50,
      width: type === "text" ? 200 : 100,
      height: type === "text" ? 40 : 100,
      rotation: 0,
      zIndex: elements.length + 1,
      styles: {
        fontFamily: "Helvetica",
        fontSize: 16,
        fontWeight: "normal",
        color: "#000000",
        backgroundColor: type === "shape" ? "#CCCCCC" : "transparent",
        borderRadius: type === "shape" ? 8 : 0,
        borderWidth: 0,
        borderColor: "#000000",
        opacity: 1
      }
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };
  
  // Función para eliminar un elemento posicionable
  const removePositionableElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };
  
  // Función para actualizar un elemento posicionable
  const updatePositionableElement = (id: string, updates: Partial<PositionableElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };
  
  // Función para actualizar el estilo de un elemento
  const updateElementStyle = (id: string, styleKey: string, value: any) => {
    setElements(elements.map(el => 
      el.id === id ? { 
        ...el, 
        styles: { 
          ...el.styles, 
          [styleKey]: value 
        } 
      } : el
    ));
  };
  
  // Renderizar elementos en el editor
  const renderElements = () => {
    return elements.map((element) => (
      <div
        key={element.id}
        className={`absolute ${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: element.zIndex,
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: element.styles.backgroundColor,
          borderRadius: `${element.styles.borderRadius}px`,
          border: element.styles.borderWidth 
            ? `${element.styles.borderWidth}px solid ${element.styles.borderColor}` 
            : 'none',
          opacity: element.styles.opacity,
          touchAction: 'none',
          userSelect: 'none'
        }}
        onMouseDown={(e) => handleDragStart(e, element.id)}
      >
        {element.type === 'text' && (
          <p
            style={{
              fontFamily: element.styles.fontFamily,
              fontSize: `${element.styles.fontSize}px`,
              fontWeight: element.styles.fontWeight,
              color: element.styles.color,
              margin: 0,
              padding: '4px',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              pointerEvents: 'none'
            }}
          >
            {element.content}
          </p>
        )}
        {element.type === 'image' && (
          <div className="w-full h-full">
            {element.content ? (
              <img 
                src={element.content} 
                alt="Element" 
                className="max-w-full max-h-full object-contain pointer-events-none" 
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        )}
        {element.type === 'barcode' && (
          <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
        )}
        
        {selectedElement === element.id && (
          <>
            <div 
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full -top-1.5 -left-1.5 cursor-nw-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')}
            />
            <div 
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full -top-1.5 -right-1.5 cursor-ne-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')}
            />
            <div 
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full -bottom-1.5 -left-1.5 cursor-sw-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')}
            />
            <div 
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full -bottom-1.5 -right-1.5 cursor-se-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, element.id, 'se')}
            />
            <div 
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full top-1/2 -left-1.5 -translate-y-1/2 cursor-w-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, element.id, 'w')}
            />
            <div 
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full top-1/2 -right-1.5 -translate-y-1/2 cursor-e-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, element.id, 'e')}
            />
            <div 
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full -top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, element.id, 'n')}
            />
            <div 
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full -bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, element.id, 's')}
            />
          </>
        )}
      </div>
    ));
  };

  // Componente para editar propiedades del elemento seleccionado
  const ElementEditor = () => {
    if (!selectedElement) return null;
    
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return null;
    
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <h3 className="text-base font-medium mb-4">Propiedades del Elemento</h3>
          <div className="space-y-4">
            {element.type === 'text' && (
              <div className="space-y-2">
                <Label>Contenido</Label>
                <Textarea 
                  value={element.content} 
                  onChange={(e) => updatePositionableElement(element.id, { content: e.target.value })}
                  rows={2}
                />
              </div>
            )}
            
            {element.type === 'image' && (
              <div className="space-y-2">
                <Label>URL de Imagen</Label>
                <Input 
                  value={element.content} 
                  onChange={(e) => updatePositionableElement(element.id, { content: e.target.value })}
                  placeholder="https://ruta/a/imagen.jpg"
                />
                <p className="text-xs text-muted-foreground">O sube una imagen directamente</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> Subir imagen
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posición X</Label>
                <Input 
                  type="number" 
                  value={element.x} 
                  onChange={(e) => updatePositionableElement(element.id, { x: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Posición Y</Label>
                <Input 
                  type="number" 
                  value={element.y} 
                  onChange={(e) => updatePositionableElement(element.id, { y: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ancho</Label>
                <Input 
                  type="number" 
                  value={element.width} 
                  onChange={(e) => updatePositionableElement(element.id, { width: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alto</Label>
                <Input 
                  type="number" 
                  value={element.height} 
                  onChange={(e) => updatePositionableElement(element.id, { height: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rotación</Label>
                <Input 
                  type="number" 
                  value={element.rotation} 
                  onChange={(e) => updatePositionableElement(element.id, { rotation: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Capa (Z-Index)</Label>
                <Input 
                  type="number" 
                  value={element.zIndex} 
                  onChange={(e) => updatePositionableElement(element.id, { zIndex: Number(e.target.value) })}
                />
              </div>
            </div>
            
            {element.type === 'text' && (
              <>
                <div className="space-y-2">
                  <Label>Color de Texto</Label>
                  <ColorPicker
                    color={element.styles.color || '#000000'}
                    onChange={(color) => updateElementStyle(element.id, 'color', color)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tamaño de Fuente</Label>
                  <Input 
                    type="number" 
                    value={element.styles.fontSize} 
                    onChange={(e) => updateElementStyle(element.id, 'fontSize', Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Fuente</Label>
                  <Select 
                    value={element.styles.fontFamily} 
                    onValueChange={(value) => updateElementStyle(element.id, 'fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Tahoma">Tahoma</SelectItem>
                      <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                      <SelectItem value="Impact">Impact</SelectItem>
                      <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Peso de Fuente</Label>
                  <Select 
                    value={element.styles.fontWeight} 
                    onValueChange={(value) => updateElementStyle(element.id, 'fontWeight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar peso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="100">100 (Thin)</SelectItem>
                      <SelectItem value="200">200 (Extra Light)</SelectItem>
                      <SelectItem value="300">300 (Light)</SelectItem>
                      <SelectItem value="400">400 (Normal)</SelectItem>
                      <SelectItem value="500">500 (Medium)</SelectItem>
                      <SelectItem value="600">600 (Semi Bold)</SelectItem>
                      <SelectItem value="700">700 (Bold)</SelectItem>
                      <SelectItem value="800">800 (Extra Bold)</SelectItem>
                      <SelectItem value="900">900 (Black)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label>Color de Fondo</Label>
              <ColorPicker
                color={element.styles.backgroundColor || 'transparent'}
                onChange={(color) => updateElementStyle(element.id, 'backgroundColor', color)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Borde Radio</Label>
                <Input 
                  type="number" 
                  value={element.styles.borderRadius} 
                  onChange={(e) => updateElementStyle(element.id, 'borderRadius', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Opacidad</Label>
                <Input 
                  type="number" 
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.styles.opacity} 
                  onChange={(e) => updateElementStyle(element.id, 'opacity', Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ancho de Borde</Label>
                <Input 
                  type="number" 
                  value={element.styles.borderWidth} 
                  onChange={(e) => updateElementStyle(element.id, 'borderWidth', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Color de Borde</Label>
                <ColorPicker
                  color={element.styles.borderColor || '#000000'}
                  onChange={(color) => updateElementStyle(element.id, 'borderColor', color)}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                variant="destructive" 
                onClick={() => removePositionableElement(element.id)}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Elemento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Editor de Posicionamiento Libre</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => addPositionableElement("text")}>
            <Edit className="mr-2 h-4 w-4" /> Texto
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPositionableElement("image")}>
            <Image className="mr-2 h-4 w-4" /> Imagen
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPositionableElement("barcode")}>
            <QrCode className="mr-2 h-4 w-4" /> Código
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPositionableElement("shape")}>
            <Square className="mr-2 h-4 w-4" /> Forma
          </Button>
        </div>
      </div>
      
      <div 
        ref={canvasRef}
        className="relative border rounded-md overflow-hidden mx-auto"
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          backgroundColor, 
          maxWidth: '100%',
          maxHeight: '600px'
        }}
        onClick={handleCanvasClick}
      >
        {renderElements()}
      </div>
      
      <ElementEditor />
    </div>
  );
}
