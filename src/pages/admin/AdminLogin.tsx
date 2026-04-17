import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoSinos from "@/assets/logo-sinos-imoveis.png";
import { Lock, Mail, AlertCircle, LogIn } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/admin", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const result = await login(email.trim(), password.trim());
      if (!result.success) {
        setError(result.error || "E-mail ou senha incorretos.");
      } else {
        navigate("/admin");
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-primary rounded-2xl shadow-xl border border-primary/80 p-8">
          <div className="flex flex-col items-center mb-8">
            <img src={logoSinos} alt="Sinos Imóveis" className="h-20 w-auto mb-4" />
            <h1 className="text-2xl font-semibold text-primary-foreground">
              Painel Administrativo
            </h1>
            <p className="text-primary-foreground/70 text-sm mt-1">
              Acesse com suas credenciais
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary-foreground">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary-foreground">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[hsl(48,100%,50%)] text-foreground hover:bg-[hsl(48,100%,45%)] font-bold"
              size="lg"
              disabled={loading}
            >
              {loading ? "Aguarde..." : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <p className="w-full text-center text-xs text-primary-foreground/60 mt-4">
            Acesso restrito à equipe. Solicite um cadastro ao administrador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
