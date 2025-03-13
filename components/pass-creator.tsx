"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ColorPicker } from "@/components/color-picker"
import { PassPreview } from "@/components/pass-preview"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Upload, Plus, Trash2 } from "lucide-react"

// Define un tipo para los campos personalizados
interface CustomField {
  id: string;
  key: string;
  label: string;
  value: string;
  textAlignment: "left" | "center" | "right" | "natural";
}

// Definir el tipo de pase
type PassType = "event" | "loyalty" | "coupon" | "boarding" | "generic" | "storeCard";

export function PassCreator() {
  const [passType, setPassType] = useState<PassType>("event")
  const [passData, setPassData] = useState({
    title: "Executive Engineers Conference",
    subtitle: "Annual Tech Summit",
    description: "Join us for our annual technology conference",
    logoText: "EE",
    organizationName: "Executive Engineers",
    
    // Colores
    primaryColor: "#00a8e1",
    secondaryColor: "#14181B",
    backgroundColor: "#FFFFFF",
    foregroundColor: "#000000",
    labelColor: "#6B7280",
    logoTextColor: "#FFFFFF",
    
    // Ubicación y fechas
    location: "San Francisco, CA",
    date: "2025-06-15",
    time: "09:00",
    
    // Opciones de configuración
    barcode: true,
    barcodeFormat: "qr",
    notifications: true,
    
    // Imágenes
    logoImage: "",
    iconImage: "",
    stripImage: "",
    footerImage: "",
    backgroundImage: "",
    thumbnailImage: "",
    
    // Opciones de relevancia
    relevantDate: "",
    expirationDate: "",
    voided: false,
    
    // Alineación
    headerAlignment: "natural",
    primaryAlignment: "natural",
    secondaryAlignment: "natural",
    auxiliaryAlignment: "natural",
    
    // Estilo de fecha
    dateStyle: "medium",
    timeStyle: "short",
    
    // Reverso
    showReverse: false,
  })
  
  // Estados para campos personalizados por sección
  const [headerFields, setHeaderFields] = useState<CustomField[]>([])
  const [primaryFields, setPrimaryFields] = useState<CustomField[]>([])
  const [secondaryFields, setSecondaryFields] = useState<CustomField[]>([])
  const [auxiliaryFields, setAuxiliaryFields] = useState<CustomField[]>([])
  const [backFields, setBackFields] = useState<CustomField[]>([])

  const handleChange = (field: string, value: string | boolean) => {
    setPassData((prev) => ({ ...prev, [field]: value }))
  }
  
  // Función para añadir un nuevo campo personalizado
  const addCustomField = (section: string) => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      key: "",
      label: "",
      value: "",
      textAlignment: "natural"
    }
    
    switch(section) {
      case "header":
        setHeaderFields([...headerFields, newField])
        break
      case "primary":
        setPrimaryFields([...primaryFields, newField])
        break
      case "secondary":
        setSecondaryFields([...secondaryFields, newField])
        break
      case "auxiliary":
        setAuxiliaryFields([...auxiliaryFields, newField])
        break
      case "back":
        setBackFields([...backFields, newField])
        break
    }
  }
  
  // Función para actualizar un campo personalizado
  const updateCustomField = (section: string, id: string, field: string, value: string) => {
    const updateField = (fields: CustomField[]) => 
      fields.map(f => f.id === id ? {...f, [field]: value} : f)
    
    switch(section) {
      case "header":
        setHeaderFields(updateField(headerFields))
        break
      case "primary":
        setPrimaryFields(updateField(primaryFields))
        break
      case "secondary":
        setSecondaryFields(updateField(secondaryFields))
        break
      case "auxiliary":
        setAuxiliaryFields(updateField(auxiliaryFields))
        break
      case "back":
        setBackFields(updateField(backFields))
        break
    }
  }
  
  // Función para eliminar un campo personalizado
  const removeCustomField = (section: string, id: string) => {
    const filterFields = (fields: CustomField[]) => 
      fields.filter(f => f.id !== id)
    
    switch(section) {
      case "header":
        setHeaderFields(filterFields(headerFields))
        break
      case "primary":
        setPrimaryFields(filterFields(primaryFields))
        break
      case "secondary":
        setSecondaryFields(filterFields(secondaryFields))
        break
      case "auxiliary":
        setAuxiliaryFields(filterFields(auxiliaryFields))
        break
      case "back":
        setBackFields(filterFields(backFields))
        break
    }
  }
  
  // Renderizado de campos personalizados
  const renderCustomFields = (section: string, fields: CustomField[]) => {
    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="border rounded-md p-4 space-y-3 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeCustomField(section, field.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <div className="space-y-2">
              <Label>Campo ID</Label>
              <Input 
                value={field.key} 
                onChange={(e) => updateCustomField(section, field.id, "key", e.target.value)}
                placeholder="identificador_unico"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Etiqueta</Label>
              <Input 
                value={field.label} 
                onChange={(e) => updateCustomField(section, field.id, "label", e.target.value)}
                placeholder="Nombre visible"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input 
                value={field.value} 
                onChange={(e) => updateCustomField(section, field.id, "value", e.target.value)}
                placeholder="Contenido del campo"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Alineación</Label>
              <Select 
                value={field.textAlignment} 
                onValueChange={(value: "left" | "center" | "right" | "natural") => updateCustomField(section, field.id, "textAlignment", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar alineación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Izquierda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Derecha</SelectItem>
                  <SelectItem value="natural">Automática</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => addCustomField(section)}
        >
          <Plus className="mr-2 h-4 w-4" /> Añadir campo
        </Button>
      </div>
    )
  }

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Create Your Digital Pass</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
            Customize every aspect of your digital wallet pass
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Tabs defaultValue="design" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="design">Diseño</TabsTrigger>
                <TabsTrigger value="content">Contenido</TabsTrigger>
                <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                <TabsTrigger value="fields">Campos</TabsTrigger>
              </TabsList>

              {/* Pestaña de diseño */}
              <TabsContent value="design" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {/* Tipo de pase */}
                    <div className="space-y-2">
                      <Label htmlFor="passType">Tipo de Pase</Label>
                      <Select value={passType} onValueChange={(value: PassType) => setPassType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo de pase" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event">Boleto de Evento</SelectItem>
                          <SelectItem value="boarding">Pase de Embarque</SelectItem>
                          <SelectItem value="coupon">Cupón</SelectItem>
                          <SelectItem value="storeCard">Tarjeta de Tienda</SelectItem>
                          <SelectItem value="generic">Genérico</SelectItem>
                          <SelectItem value="loyalty">Tarjeta de Fidelidad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Colores */}
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="text-base font-medium">Colores</h3>
                      
                      <div className="space-y-2">
                        <Label>Color Primario</Label>
                        <ColorPicker
                          color={passData.primaryColor}
                          onChange={(color) => handleChange("primaryColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color principal del pase</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color Secundario</Label>
                        <ColorPicker
                          color={passData.secondaryColor}
                          onChange={(color) => handleChange("secondaryColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color secundario para acentos</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color de Fondo</Label>
                        <ColorPicker
                          color={passData.backgroundColor}
                          onChange={(color) => handleChange("backgroundColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color de fondo del pase</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color de Texto</Label>
                        <ColorPicker
                          color={passData.foregroundColor}
                          onChange={(color) => handleChange("foregroundColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color principal del texto</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color de Etiquetas</Label>
                        <ColorPicker
                          color={passData.labelColor}
                          onChange={(color) => handleChange("labelColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color para etiquetas descriptivas</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color del Texto del Logo</Label>
                        <ColorPicker
                          color={passData.logoTextColor}
                          onChange={(color) => handleChange("logoTextColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color para el texto junto al logo</p>
                      </div>
                    </div>
                    
                    {/* Imágenes */}
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="text-base font-medium">Imágenes</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="logoUpload">Logo (90×90)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="logoUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">Logo principal</p>
                            </div>
                            <input id="logoUpload" type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="iconUpload">Icono (29×29)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="iconUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">Icono para notificaciones</p>
                            </div>
                            <input id="iconUpload" type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stripUpload">Imagen Superior (320×84-110)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="stripUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">Strip Image</p>
                            </div>
                            <input id="stripUpload" type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backgroundUpload">Imagen de Fondo (320×480)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="backgroundUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">Imagen de fondo completa</p>
                            </div>
                            <input id="backgroundUpload" type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="thumbnailUpload">Miniatura (90×90)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="thumbnailUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">Miniatura destacada</p>
                            </div>
                            <input id="thumbnailUpload" type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="footerUpload">Pie de Página (300×16)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="footerUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">Imagen en el pie del pase</p>
                            </div>
                            <input id="footerUpload" type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Códigos */}
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="text-base font-medium">Códigos de Barras/QR</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="barcode">Incluir Código</Label>
                          <p className="text-xs text-muted-foreground">Añadir un código escaneable al pase</p>
                        </div>
                        <Switch
                          id="barcode"
                          checked={passData.barcode}
                          onCheckedChange={(checked) => handleChange("barcode", checked)}
                        />
                      </div>
                      
                      {passData.barcode && (
                        <div className="space-y-2">
                          <Label>Formato del Código</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="qr" 
                                value="qr" 
                                checked={passData.barcodeFormat === "qr"}
                                onChange={() => handleChange("barcodeFormat", "qr")}
                              />
                              <Label htmlFor="qr">QR Code</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="pdf417" 
                                value="pdf417" 
                                checked={passData.barcodeFormat === "pdf417"}
                                onChange={() => handleChange("barcodeFormat", "pdf417")}
                              />
                              <Label htmlFor="pdf417">PDF417</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="aztec" 
                                value="aztec" 
                                checked={passData.barcodeFormat === "aztec"}
                                onChange={() => handleChange("barcodeFormat", "aztec")}
                              />
                              <Label htmlFor="aztec">Aztec</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="code128" 
                                value="code128" 
                                checked={passData.barcodeFormat === "code128"}
                                onChange={() => handleChange("barcodeFormat", "code128")}
                              />
                              <Label htmlFor="code128">Code 128</Label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de contenido */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={passData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtítulo</Label>
                      <Input
                        id="subtitle"
                        value={passData.subtitle}
                        onChange={(e) => handleChange("subtitle", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Nombre de Organización</Label>
                      <Input
                        id="organizationName"
                        value={passData.organizationName}
                        onChange={(e) => handleChange("organizationName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={passData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={passData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logoText">Texto del Logo</Label>
                        <Input
                          id="logoText"
                          value={passData.logoText}
                          onChange={(e) => handleChange("logoText", e.target.value)}
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                          id="date"
                          type="date"
                          value={passData.date}
                          onChange={(e) => handleChange("date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Hora</Label>
                        <Input
                          id="time"
                          type="time"
                          value={passData.time}
                          onChange={(e) => handleChange("time", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pestaña de opciones avanzadas */}
              <TabsContent value="advanced" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateStyle">Estilo de Fecha</Label>
                      <Select 
                        value={passData.dateStyle} 
                        onValueChange={(value) => handleChange("dateStyle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estilo de fecha" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          <SelectItem value="short">Corto (01/01/2023)</SelectItem>
                          <SelectItem value="medium">Medio (1 Ene 2023)</SelectItem>
                          <SelectItem value="long">Largo (1 de Enero de 2023)</SelectItem>
                          <SelectItem value="full">Completo (Lunes, 1 de Enero de 2023)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeStyle">Estilo de Hora</Label>
                      <Select 
                        value={passData.timeStyle} 
                        onValueChange={(value) => handleChange("timeStyle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estilo de hora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          <SelectItem value="short">Corto (9:00)</SelectItem>
                          <SelectItem value="medium">Medio (9:00 AM)</SelectItem>
                          <SelectItem value="long">Largo (9:00:00 AM GMT+1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="relevantDate">Fecha Relevante</Label>
                      <Input
                        id="relevantDate"
                        type="datetime-local"
                        value={passData.relevantDate}
                        onChange={(e) => handleChange("relevantDate", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Cuándo el pase será relevante para mostrar en el dispositivo</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Fecha de Expiración</Label>
                      <Input
                        id="expirationDate"
                        type="datetime-local"
                        value={passData.expirationDate}
                        onChange={(e) => handleChange("expirationDate", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Cuándo el pase expirará y se marcará como obsoleto</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="voided">Pase Anulado</Label>
                        <p className="text-xs text-muted-foreground">Marca el pase como no válido</p>
                      </div>
                      <Switch
                        id="voided"
                        checked={passData.voided}
                        onCheckedChange={(checked) => handleChange("voided", checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Alineación de Texto</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="headerAlignment" className="text-xs">Cabecera</Label>
                          <Select 
                            value={passData.headerAlignment} 
                            onValueChange={(value) => handleChange("headerAlignment", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Alineación" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Izquierda</SelectItem>
                              <SelectItem value="center">Centro</SelectItem>
                              <SelectItem value="right">Derecha</SelectItem>
                              <SelectItem value="natural">Automática</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="primaryAlignment" className="text-xs">Campos Primarios</Label>
                          <Select 
                            value={passData.primaryAlignment} 
                            onValueChange={(value) => handleChange("primaryAlignment", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Alineación" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Izquierda</SelectItem>
                              <SelectItem value="center">Centro</SelectItem>
                              <SelectItem value="right">Derecha</SelectItem>
                              <SelectItem value="natural">Automática</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showReverse">Mostrar Reverso</Label>
                        <p className="text-xs text-muted-foreground">Habilitar campos en el reverso del pase</p>
                      </div>
                      <Switch
                        id="showReverse"
                        checked={passData.showReverse}
                        onCheckedChange={(checked) => handleChange("showReverse", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pestaña de campos personalizados */}
              <TabsContent value="fields" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-6">
                      <div className="border rounded-md p-4">
                        <h3 className="text-base font-medium mb-4">Campos de Cabecera</h3>
                        {renderCustomFields("header", headerFields)}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="text-base font-medium mb-4">Campos Primarios</h3>
                        {renderCustomFields("primary", primaryFields)}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="text-base font-medium mb-4">Campos Secundarios</h3>
                        {renderCustomFields("secondary", secondaryFields)}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="text-base font-medium mb-4">Campos Auxiliares</h3>
                        {renderCustomFields("auxiliary", auxiliaryFields)}
                      </div>
                      
                      {passData.showReverse && (
                        <div className="border rounded-md p-4">
                          <h3 className="text-base font-medium mb-4">Campos de Reverso</h3>
                          {renderCustomFields("back", backFields)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center space-x-4">
              <Button variant="outline">Guardar Borrador</Button>
              <Button className="bg-primary hover:bg-primary/90">Crear Pase</Button>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-6">Vista Previa del Pase</h3>
            <PassPreview passType={passType} passData={passData} />
          </div>
        </div>
      </div>
    </section>
  )
}

