"use client";

import * as React from "react";
import {
  Brain,
  Check,
  ChevronRight,
  FilePlus2,
  Library,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { flashcardsService } from "@/services/flashcards.service";
import type { Flashcard, FlashcardDeck, FlashcardRating } from "@/types/academic";

const ratings: Array<{ value: FlashcardRating; label: string; icon: typeof Check }> = [
  { value: "again", label: "De novo", icon: RotateCcw },
  { value: "hard", label: "Difícil", icon: X },
  { value: "good", label: "Bom", icon: Check },
  { value: "easy", label: "Fácil", icon: ChevronRight },
];

export function FlashcardsWorkspace() {
  const { user } = useAuthContext();
  const userId = user?.id ?? "";
  const [decks, setDecks] = React.useState<FlashcardDeck[]>([]);
  const [cards, setCards] = React.useState<Flashcard[]>([]);
  const [selectedDeckId, setSelectedDeckId] = React.useState("");
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");
  const [material, setMaterial] = React.useState("");
  const [deckTitle, setDeckTitle] = React.useState("");
  const [deckSubject, setDeckSubject] = React.useState("");
  const [flipped, setFlipped] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [now] = React.useState(() => Date.now());

  const refresh = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await flashcardsService.list(userId);
      setDecks(result.decks);
      setCards(result.cards);
      setSelectedDeckId((current) => current || result.decks[0]?.id || "");
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível carregar os flashcards.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);
  React.useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);
  if (!user)
    return (
      <EmptyState
        icon={Brain}
        title="Sessão necessária"
        description="Entre na sua conta para estudar com flashcards."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? null;
  const dueCards = cards.filter(
    (card) => card.deckId === selectedDeckId && flashcardsService.isDue(card, new Date(now)),
  );
  const currentCard = dueCards[0] ?? null;
  async function createDeck() {
    setSaving(true);
    try {
      const deck = await flashcardsService.createDeck(userId, {
        title: deckTitle,
        subjectName: deckSubject,
      });
      setDecks((current) => [deck, ...current]);
      setSelectedDeckId(deck.id);
      setDeckTitle("");
      setDeckSubject("");
      toast.success("Baralho criado.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível criar o baralho.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function createCard() {
    if (!selectedDeck) return;
    setSaving(true);
    try {
      const card = await flashcardsService.createManualCard(userId, selectedDeck, { front, back });
      setCards((current) => [card, ...current]);
      setDecks((current) =>
        current.map((deck) =>
          deck.id === selectedDeck.id ? { ...deck, cardCount: deck.cardCount + 1 } : deck,
        ),
      );
      setFront("");
      setBack("");
      toast.success("Flashcard criado.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível criar o cartão.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function generateCards() {
    if (!selectedDeck) return;
    setSaving(true);
    try {
      const generated = await flashcardsService.generateFromText(userId, selectedDeck, material);
      setCards((current) => [...generated, ...current]);
      setDecks((current) =>
        current.map((deck) =>
          deck.id === selectedDeck.id
            ? { ...deck, cardCount: deck.cardCount + generated.length }
            : deck,
        ),
      );
      setMaterial("");
      toast.success(`${generated.length} flashcard(s) criado(s).`);
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível gerar os cartões.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function review(rating: FlashcardRating) {
    if (!currentCard) return;
    setSaving(true);
    try {
      const updated = await flashcardsService.review(userId, currentCard, rating);
      setCards((current) => current.map((card) => (card.id === updated.id ? updated : card)));
      setFlipped(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
      <aside className="grid content-start gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Library className="text-primary" />
              Baralhos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : decks.length ? (
              decks.map((deck) => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setFlipped(false);
                  }}
                  className={`flex items-center justify-between rounded-md border p-3 text-left text-sm ${selectedDeckId === deck.id ? "border-primary bg-primary/10" : "bg-background"}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{deck.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {deck.subjectName} · {deck.cardCount}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0" />
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Crie seu primeiro baralho.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novo baralho</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              value={deckTitle}
              onChange={(input) => setDeckTitle(input.target.value)}
              placeholder="Ex.: Cálculo I"
            />
            <Input
              value={deckSubject}
              onChange={(input) => setDeckSubject(input.target.value)}
              placeholder="Disciplina"
            />
            <Button
              onClick={() => void createDeck()}
              disabled={saving || !deckTitle.trim() || !deckSubject.trim()}
            >
              <Plus /> Criar baralho
            </Button>
          </CardContent>
        </Card>
      </aside>
      <main className="grid gap-6">
        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
            {error}
          </div>
        ) : null}
        {selectedDeck ? (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{selectedDeck.subjectName}</p>
                <h1 className="text-2xl font-semibold">{selectedDeck.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedDeck.cardCount} cartões · {dueCards.length} para revisar agora
                </p>
              </div>
              <Badge variant={dueCards.length ? "default" : "secondary"}>
                {dueCards.length ? "Revisão pendente" : "Em dia"}
              </Badge>
            </div>
            <ReviewCard
              card={currentCard}
              flipped={flipped}
              onFlip={() => setFlipped((value) => !value)}
              onRate={review}
              saving={saving}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    Gerar automaticamente
                  </CardTitle>
                  <CardDescription>
                    Use linhas com “conceito: explicação” ou frases completas. O texto é preservado
                    como resposta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Textarea
                    value={material}
                    onChange={(input) => setMaterial(input.target.value)}
                    placeholder="Fotossíntese: processo que converte luz em energia química..."
                    className="min-h-32"
                  />
                  <Button
                    onClick={() => void generateCards()}
                    disabled={saving || !material.trim()}
                  >
                    <Sparkles /> Gerar cartões
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePlus2 className="text-primary" />
                    Criar manualmente
                  </CardTitle>
                  <CardDescription>
                    Escreva frente e verso para controlar exatamente o conteúdo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Label htmlFor="card-front">Frente</Label>
                  <Input
                    id="card-front"
                    value={front}
                    onChange={(input) => setFront(input.target.value)}
                    placeholder="O que é..."
                  />
                  <Label htmlFor="card-back">Verso</Label>
                  <Textarea
                    id="card-back"
                    value={back}
                    onChange={(input) => setBack(input.target.value)}
                    placeholder="Resposta curta e verificável"
                  />
                  <Button
                    onClick={() => void createCard()}
                    disabled={saving || !front.trim() || !back.trim()}
                  >
                    <Plus /> Criar flashcard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Library}
            title="Nenhum baralho selecionado"
            description="Crie um baralho por disciplina para começar."
          />
        )}
      </main>
    </div>
  );
}

function ReviewCard({
  card,
  flipped,
  onFlip,
  onRate,
  saving,
}: {
  card: Flashcard | null;
  flipped: boolean;
  onFlip: () => void;
  onRate: (rating: FlashcardRating) => Promise<void>;
  saving: boolean;
}) {
  if (!card)
    return (
      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <Check className="size-8 text-emerald-500" />
          <p className="font-medium">Tudo revisado por enquanto.</p>
          <p className="text-sm text-muted-foreground">
            Volte depois para acompanhar a próxima revisão espaçada.
          </p>
        </CardContent>
      </Card>
    );
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {flipped ? "Verso" : "Frente"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid min-h-48 place-items-center gap-5 text-center">
        <p className="max-w-2xl text-xl font-medium">{flipped ? card.back : card.front}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={onFlip}>
            {flipped ? "Mostrar frente" : "Mostrar verso"}
          </Button>
          {flipped
            ? ratings.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={value === "again" ? "destructive" : "secondary"}
                  onClick={() => void onRate(value)}
                  disabled={saving}
                >
                  <Icon /> {label}
                </Button>
              ))
            : null}
        </div>
      </CardContent>
    </Card>
  );
}
