"use client"

import { useState, useRef, useEffect } from "react"
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  const editorRef = useRef<HTMLDivElement>(null);
  
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
  
  // Manejador de inicio de arrastre
  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElement(id);
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setIsDragging(true);
  };
  
  // Manejador de movimiento durante arrastre
  const handleEditorMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !editorRef.current) return;
    
    const editorRect = editorRef.current.getBoundingClientRect();
    let x = e.clientX - editorRect.left - dragOffset.x;
    let y = e.clientY - editorRect.top - dragOffset.y;
    
    // Limitar dentro del editor
    const element = elements.find(el => el.id === selectedElement);
    if (element) {
      x = Math.max(0, Math.min(width - element.width, x));
      y = Math.max(0, Math.min(height - element.height, y));
    }
    
    updatePositionableElement(selectedElement, { x, y });
  };
  
  // Manejador para finalizar arrastre
  const handleEditorMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };
  
  // Manejador para iniciar redimensionamiento
  const handleResizeStart = (e: React.MouseEvent, id: string, direction: string) => {
    e.stopPropagation();
    setSelectedElement(id);
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    setStartSize({ width: element.width, height: element.height });
    setStartPosition({ x: element.x, y: element.y });
    
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (editorRect) {
      setDragOffset({
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  // Componente para manejar esquinas de redimensionamiento
  const ResizeHandle = ({ 
    id, 
    direction 
  }: { 
    id: string;
    direction: string;
  }) => {
    const getPositionStyle = () => {
      switch (direction) {
        case 'top-left':
          return { top: -5, left: -5 };
        case 'top-right':
          return { top: -5, right: -5 };
        case 'bottom-left':
          return { bottom: -5, left: -5 };
        case 'bottom-right':
          return { bottom: -5, right: -5 };
        default:
          return {};
      }
    };
    
    return (
      <div
        className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize z-50"
        style={{
          ...getPositionStyle(),
          cursor: direction.includes('top-left') || direction.includes('bottom-right') 
            ? 'nwse-resize' 
            : 'nesw-resize'
        }}
        onMouseDown={(e) => handleResizeStart(e, id, direction)}
      />
    );
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
          cursor: 'move',
          backgroundColor: element.styles.backgroundColor,
          borderRadius: `${element.styles.borderRadius}px`,
          border: element.styles.borderWidth 
            ? `${element.styles.borderWidth}px solid ${element.styles.borderColor}` 
            : 'none',
          opacity: element.styles.opacity
        }}
        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        onClick={(e) => e.stopPropagation()}
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
          <div className="flex items-center justify-center w-full h-full">
            {element.content ? (
              <img 
                src={element.content} 
                alt="Custom element" 
                className="max-w-full max-h-full object-contain pointer-events-none" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 pointer-events-none">
                <Upload className="h-6 w-6 text-gray-400" />
                <p className="text-xs text-gray-500">Imagen</p>
              </div>
            )}
          </div>
        )}
        {element.type === 'barcode' && (
          <div className="flex items-center justify-center w-full h-full pointer-events-none">
            <div className="bg-gray-900 w-full h-full flex items-center justify-center">
              <QrCode className="h-1/2 w-1/2 text-white" />
            </div>
          </div>
        )}
        
        {selectedElement === element.id && (
          <>
            <ResizeHandle id={element.id} direction="top-left" />
            <ResizeHandle id={element.id} direction="top-right" />
            <ResizeHandle id={element.id} direction="bottom-left" />
            <ResizeHandle id={element.id} direction="bottom-right" />
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
        ref={editorRef}
        className="relative border rounded-md overflow-hidden mx-auto"
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          backgroundColor: backgroundColor 
        }}
        onMouseMove={handleEditorMouseMove}
        onMouseUp={handleEditorMouseUp}
        onMouseLeave={handleEditorMouseUp}
        onClick={() => setSelectedElement(null)}
      >
        {renderElements()}
      </div>
      
      <ElementEditor />
    </div>
  );
}
