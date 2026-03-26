import { useState, useRef, useCallback } from "react";
import { Pencil, X, Upload, GripVertical, Check, Plus } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useChangeLog } from "@/contexts/ChangeLogContext";
import { toast } from "@/hooks/use-toast";

interface InlinePhotoEditorProps {
  photos: string[];
  propertyCode: string;
  propertyTitle: string;
  onSave: (photos: string[]) => void;
  children: React.ReactNode;
}

const InlinePhotoEditor = ({
  photos,
  propertyCode,
  propertyTitle,
  onSave,
  children,
}: InlinePhotoEditorProps) => {
  const { isAuthenticated, roles, profile } = useAdminAuth();
  const role = roles[0] || null;
  const userName = profile?.full_name || null;
  const { addLog } = useChangeLog();
  const [editing, setEditing] = useState(false);
  const [editPhotos, setEditPhotos] = useState<string[]>(photos);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPhotos = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!fileArray.length) return;
      const newUrls = fileArray.map((f) => URL.createObjectURL(f));
      setEditPhotos((prev) => [...prev, ...newUrls]);
    },
    []
  );

  const removePhoto = (index: number) => {
    setEditPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverIndex === null || dragItemRef.current === dragOverIndex) {
      setDragOverIndex(null);
      dragItemRef.current = null;
      return;
    }
    const updated = [...editPhotos];
    const [moved] = updated.splice(dragItemRef.current, 1);
    updated.splice(dragOverIndex, 0, moved);
    setEditPhotos(updated);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  const handleSave = () => {
    onSave(editPhotos);
    if (role === "corretor") {
      addLog({
        propertyCode,
        propertyTitle,
        field: "Fotos",
        oldValue: `${photos.length} fotos`,
        newValue: `${editPhotos.length} fotos`,
        changedBy: userName || "Corretor",
        role: "corretor",
      });
    }
    toast({
      title: "Fotos atualizadas",
      description: role === "corretor"
        ? "Alteração nas fotos registrada no log."
        : "Fotos atualizadas com sucesso.",
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditPhotos(photos);
    setEditing(false);
  };

  if (!isAuthenticated) return <>{children}</>;

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            Arraste para reordenar • A primeira foto será a capa
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </button>
            <button
              onClick={handleSave}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addPhotos(e.target.files)}
        />

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {editPhotos.map((img, index) => (
            <div
              key={`${img}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all group ${
                dragOverIndex === index
                  ? "border-accent scale-105"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <img src={img} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                  CAPA
                </span>
              )}
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-[9px] text-center py-0.5">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Add photo placeholder */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px] font-medium">Adicionar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/photos">
      {children}
      <button
        onClick={() => { setEditPhotos(photos); setEditing(true); }}
        className="absolute top-4 left-4 z-10 opacity-70 hover:opacity-100 transition-opacity w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 shadow-md"
        title="Editar fotos"
        style={{ marginTop: "40px" }}
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
};

export default InlinePhotoEditor;
