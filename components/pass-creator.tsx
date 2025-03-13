"use client"

import { useState, useEffect } from "react"
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
import { Upload, Plus, Trash2, ArrowDown, ArrowUp, Image, QrCode, Download } from "lucide-react"
import { AdvancedPassEditor, PositionableElement } from "@/components/advanced-pass-editor"

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
    
    // Nuevas opciones para personalización avanzada
    useAdvancedEditor: false,
    customWidth: 320,
    customHeight: 480,
    allowCustomDimensions: true,
    customPassType: false,
    allowFullCustomization: false,
  })
  
  // Estados para campos personalizados por sección
  const [headerFields, setHeaderFields] = useState<CustomField[]>([])
  const [primaryFields, setPrimaryFields] = useState<CustomField[]>([])
  const [secondaryFields, setSecondaryFields] = useState<CustomField[]>([])
  const [auxiliaryFields, setAuxiliaryFields] = useState<CustomField[]>([])
  const [backFields, setBackFields] = useState<CustomField[]>([])

  // Estado para editor avanzado
  const [freeElements, setFreeElements] = useState<PositionableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Estado para el estado de la generación del pase
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [certificateStatus, setCertificateStatus] = useState<{ valid: boolean; message: string } | null>(null)

  const handleChange = (field: string, value: string | boolean | number) => {
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

  // Función para verificar el estado de los certificados
  const checkCertificateStatus = async () => {
    try {
      const response = await fetch('/api/passes')
      const data = await response.json()
      setCertificateStatus(data)
    } catch (error) {
      console.error('Error checking certificate status:', error)
      setCertificateStatus({
        valid: false,
        message: 'Error checking certificate status'
      })
    }
  }
  
  // Verificar el estado de los certificados al cargar el componente
  useEffect(() => {
    checkCertificateStatus()
  }, [])
  
  // Función para generar y descargar el pase
  const generateAndDownloadPass = async () => {
    try {
      setIsGenerating(true)
      setGenerationError(null)
      
      // Preparar los datos del pase
      const passDataToSend = {
        ...passData,
        // Asegurarse de que los campos requeridos estén presentes
        barcodeMessage: passData.title,
        barcodeFormat: 'PKBarcodeFormatQR',
        // Agregar campos personalizados si es necesario
        customFields: [
          {
            key: 'description',
            label: 'DESCRIPTION',
            value: passData.description,
            textAlignment: 'left'
          }
        ]
      }
      
      // Enviar la solicitud a la API
      const response = await fetch('/api/passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passType,
          passData: passDataToSend
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate pass')
      }
      
      // Obtener el blob del pase
      const passBlob = await response.blob()
      
      // Crear un enlace de descarga
      const downloadUrl = URL.createObjectURL(passBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${passData.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pkpass`
      document.body.appendChild(a)
      a.click()
      
      // Limpiar
      URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating pass:', error)
      setGenerationError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsGenerating(false)
    }
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
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="useAdvancedEditor">Usar Editor Avanzado</Label>
                        <p className="text-xs text-muted-foreground">Habilitar la edición avanzada del pase</p>
                      </div>
                      <Switch
                        id="useAdvancedEditor"
                        checked={passData.useAdvancedEditor}
                        onCheckedChange={(checked) => handleChange("useAdvancedEditor", checked)}
                      />
                    </div>
                    
                    {passData.useAdvancedEditor && (
                      <AdvancedPassEditor 
                        backgroundColor={passData.backgroundColor}
                        width={passData.customWidth} 
                        height={passData.customHeight} 
                        elements={freeElements} 
                        setElements={setFreeElements}
                        selectedElement={selectedElement} 
                        setSelectedElement={setSelectedElement} 
                      />
                    )}
                    
                    <div className="space-y-2">
                      <Label>Ancho Personalizado</Label>
                      <Input 
                        type="number" 
                        value={passData.customWidth} 
                        onChange={(e) => handleChange("customWidth", Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Altura Personalizada</Label>
                      <Input 
                        type="number" 
                        value={passData.customHeight} 
                        onChange={(e) => handleChange("customHeight", Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowCustomDimensions">Permitir Dimensiones Personalizadas</Label>
                        <p className="text-xs text-muted-foreground">Permitir al usuario cambiar el tamaño del pase</p>
                      </div>
                      <Switch
                        id="allowCustomDimensions"
                        checked={passData.allowCustomDimensions}
                        onCheckedChange={(checked) => handleChange("allowCustomDimensions", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="customPassType">Tipo de Pase Personalizado</Label>
                        <p className="text-xs text-muted-foreground">Permitir al usuario seleccionar un tipo de pase personalizado</p>
                      </div>
                      <Switch
                        id="customPassType"
                        checked={passData.customPassType}
                        onCheckedChange={(checked) => handleChange("customPassType", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowFullCustomization">Permitir Personalización Completa</Label>
                        <p className="text-xs text-muted-foreground">Permitir al usuario personalizar completamente el pase</p>
                      </div>
                      <Switch
                        id="allowFullCustomization"
                        checked={passData.allowFullCustomization}
                        onCheckedChange={(checked) => handleChange("allowFullCustomization", checked)}
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

            <div className="mt-6 flex flex-col gap-4">
              {certificateStatus && (
                <div className={`p-4 rounded-md ${certificateStatus.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p className="text-sm font-medium">
                    {certificateStatus.valid ? '✅ Certificados de Apple Developer verificados' : `❌ ${certificateStatus.message}`}
                  </p>
                </div>
              )}
              
              <Button 
                onClick={generateAndDownloadPass} 
                disabled={isGenerating || (certificateStatus ? !certificateStatus.valid : false)}
                className="w-full"
              >
                {isGenerating ? 'Generando...' : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Pase Digital (.pkpass)
                  </>
                )}
              </Button>
              
              {generationError && (
                <div className="p-4 rounded-md bg-red-100 text-red-800">
                  <p className="text-sm font-medium">Error: {generationError}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-6">Vista Previa del Pase</h3>
            {passData.useAdvancedEditor ? (
              <div className="space-y-4 w-full">
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newElement: PositionableElement = {
                        id: `text_${Date.now()}`,
                        type: "text",
                        content: "Texto editable",
                        x: Math.floor(passData.customWidth / 2) - 50,
                        y: Math.floor(passData.customHeight / 2) - 10,
                        width: 100,
                        height: 20,
                        rotation: 0,
                        zIndex: freeElements.length + 1,
                        styles: {
                          fontFamily: "Helvetica",
                          fontSize: 16,
                          fontWeight: "normal",
                          color: "#000000",
                          backgroundColor: "transparent",
                          borderRadius: 0,
                          borderWidth: 0,
                          borderColor: "#000000",
                          opacity: 1
                        }
                      };
                      setFreeElements([...freeElements, newElement]);
                      setSelectedElement(newElement.id);
                    }}
                  >
                    Añadir Texto
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newElement: PositionableElement = {
                        id: `image_${Date.now()}`,
                        type: "image",
                        content: "",
                        x: Math.floor(passData.customWidth / 2) - 50,
                        y: Math.floor(passData.customHeight / 2) - 50,
                        width: 100,
                        height: 100,
                        rotation: 0,
                        zIndex: freeElements.length + 1,
                        styles: {
                          opacity: 1,
                          borderRadius: 0,
                          borderWidth: 0,
                          borderColor: "#000000",
                          backgroundColor: "transparent"
                        }
                      };
                      setFreeElements([...freeElements, newElement]);
                      setSelectedElement(newElement.id);
                    }}
                  >
                    Añadir Imagen
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newElement: PositionableElement = {
                        id: `barcode_${Date.now()}`,
                        type: "barcode",
                        content: "https://example.com",
                        x: Math.floor(passData.customWidth / 2) - 60,
                        y: Math.floor(passData.customHeight / 2) - 60,
                        width: 120,
                        height: 120,
                        rotation: 0,
                        zIndex: freeElements.length + 1,
                        styles: {
                          opacity: 1,
                          borderRadius: 0,
                          borderWidth: 0,
                          borderColor: "#000000",
                          backgroundColor: "transparent"
                        }
                      };
                      setFreeElements([...freeElements, newElement]);
                      setSelectedElement(newElement.id);
                    }}
                  >
                    Añadir Código
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newElement: PositionableElement = {
                        id: `shape_${Date.now()}`,
                        type: "shape",
                        content: "",
                        x: Math.floor(passData.customWidth / 2) - 40,
                        y: Math.floor(passData.customHeight / 2) - 40,
                        width: 80,
                        height: 80,
                        rotation: 0,
                        zIndex: freeElements.length + 1,
                        styles: {
                          backgroundColor: "#CCCCCC",
                          borderRadius: 8,
                          borderWidth: 0,
                          borderColor: "#000000",
                          opacity: 0.8
                        }
                      };
                      setFreeElements([...freeElements, newElement]);
                      setSelectedElement(newElement.id);
                    }}
                  >
                    Añadir Forma
                  </Button>
                </div>
                
                {selectedElement && (
                  <Card className="w-full mb-4">
                    <CardContent className="pt-4 pb-2">
                      <h4 className="text-sm font-medium mb-3">Editar Elemento</h4>
                      {freeElements.find(el => el.id === selectedElement)?.type === "text" && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Texto</Label>
                            <Textarea 
                              value={freeElements.find(el => el.id === selectedElement)?.content || ""}
                              onChange={(e) => {
                                setFreeElements(
                                  freeElements.map(el => 
                                    el.id === selectedElement 
                                      ? { ...el, content: e.target.value }
                                      : el
                                  )
                                );
                              }}
                              rows={2}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Fuente</Label>
                              <Select 
                                value={freeElements.find(el => el.id === selectedElement)?.styles.fontFamily || "Helvetica"}
                                onValueChange={(value) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              fontFamily: value 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar fuente" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                                  <SelectItem value="Arial">Arial</SelectItem>
                                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                  <SelectItem value="Courier">Courier</SelectItem>
                                  <SelectItem value="SF Pro">SF Pro</SelectItem>
                                  <SelectItem value="Georgia">Georgia</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Tamaño</Label>
                              <Input 
                                type="number" 
                                value={freeElements.find(el => el.id === selectedElement)?.styles.fontSize || 16} 
                                onChange={(e) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              fontSize: Number(e.target.value) 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                                min={8}
                                max={72}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Color de texto</Label>
                              <ColorPicker
                                color={freeElements.find(el => el.id === selectedElement)?.styles.color || "#000000"}
                                onChange={(color) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              color 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Fondo</Label>
                              <ColorPicker
                                color={freeElements.find(el => el.id === selectedElement)?.styles.backgroundColor || "transparent"}
                                onChange={(color) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              backgroundColor: color 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {freeElements.find(el => el.id === selectedElement)?.type === "shape" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Color de fondo</Label>
                              <ColorPicker
                                color={freeElements.find(el => el.id === selectedElement)?.styles.backgroundColor || "#CCCCCC"}
                                onChange={(color) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              backgroundColor: color 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Borde redondeado</Label>
                              <Input 
                                type="number" 
                                value={freeElements.find(el => el.id === selectedElement)?.styles.borderRadius || 0} 
                                onChange={(e) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              borderRadius: Number(e.target.value) 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                                min={0}
                                max={100}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Opacidad</Label>
                              <Input 
                                type="range" 
                                value={freeElements.find(el => el.id === selectedElement)?.styles.opacity || 1} 
                                onChange={(e) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              opacity: Number(e.target.value) 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                                min={0}
                                max={1}
                                step={0.05}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {freeElements.find(el => el.id === selectedElement)?.type === "barcode" && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Contenido del código</Label>
                            <Textarea 
                              value={freeElements.find(el => el.id === selectedElement)?.content || ""}
                              onChange={(e) => {
                                setFreeElements(
                                  freeElements.map(el => 
                                    el.id === selectedElement 
                                      ? { ...el, content: e.target.value }
                                      : el
                                  )
                                );
                              }}
                              rows={2}
                              placeholder="URL o texto para el código"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Tipo de código</Label>
                            <Select 
                              defaultValue="qr"
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="qr">QR Code</SelectItem>
                                <SelectItem value="pdf417">PDF417</SelectItem>
                                <SelectItem value="aztec">Aztec</SelectItem>
                                <SelectItem value="code128">Code 128</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      
                      {freeElements.find(el => el.id === selectedElement)?.type === "image" && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>URL de la imagen</Label>
                            <Input 
                              placeholder="https://ejemplo.com/imagen.jpg" 
                              value={freeElements.find(el => el.id === selectedElement)?.content || ""}
                              onChange={(e) => {
                                setFreeElements(
                                  freeElements.map(el => 
                                    el.id === selectedElement 
                                      ? { ...el, content: e.target.value }
                                      : el
                                  )
                                );
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Subir imagen</Label>
                            <Button variant="outline" className="w-full">
                              <Upload className="mr-2 h-4 w-4" />
                              Seleccionar archivo
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Borde redondeado</Label>
                              <Input 
                                type="number" 
                                value={freeElements.find(el => el.id === selectedElement)?.styles.borderRadius || 0} 
                                onChange={(e) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              borderRadius: Number(e.target.value) 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                                min={0}
                                max={100}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Opacidad</Label>
                              <Input 
                                type="range" 
                                value={freeElements.find(el => el.id === selectedElement)?.styles.opacity || 1} 
                                onChange={(e) => {
                                  setFreeElements(
                                    freeElements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            styles: { 
                                              ...el.styles, 
                                              opacity: Number(e.target.value) 
                                            } 
                                          }
                                        : el
                                    )
                                  );
                                }}
                                min={0}
                                max={1}
                                step={0.05}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setFreeElements(freeElements.filter(el => el.id !== selectedElement));
                            setSelectedElement(null);
                          }}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Eliminar
                        </Button>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setFreeElements(
                                freeElements.map(el => {
                                  if (el.id === selectedElement) {
                                    return {
                                      ...el,
                                      zIndex: Math.max(1, el.zIndex - 1)
                                    };
                                  }
                                  return el;
                                })
                              );
                            }}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setFreeElements(
                                freeElements.map(el => {
                                  if (el.id === selectedElement) {
                                    return {
                                      ...el,
                                      zIndex: el.zIndex + 1
                                    };
                                  }
                                  return el;
                                })
                              );
                            }}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedElement(null);
                            }}
                          >
                            Listo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div 
                  className="border rounded-md overflow-hidden shadow-md relative mx-auto"
                  style={{ 
                    width: `${passData.customWidth}px`, 
                    height: `${passData.customHeight}px`,
                    backgroundColor: passData.backgroundColor,
                    maxWidth: '100%',
                    maxHeight: '600px'
                  }}
                >
                  {freeElements.map((element) => (
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
                        backgroundColor: element.styles.backgroundColor,
                        borderRadius: `${element.styles.borderRadius}px`,
                        border: element.styles.borderWidth 
                          ? `${element.styles.borderWidth}px solid ${element.styles.borderColor}` 
                          : 'none',
                        opacity: element.styles.opacity,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedElement(element.id)}
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
                            overflow: 'hidden'
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
                              alt="Custom element" 
                              className="max-w-full max-h-full object-contain" 
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                              <Image className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                      {element.type === 'barcode' && (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <QrCode className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {element.type === 'shape' && (
                        <div className="w-full h-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <PassPreview passType={passType} passData={passData} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
