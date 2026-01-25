import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface FlagItem {
  id: string;
  type: string;
  severity: string;
  status: string;
  evidence: any;
  createdAt: string;
}

const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
    case "CRITICAL":
      return "destructive";
    case "WARN":
      return "default";
    default:
      return "secondary";
  }
};

export default function FlagsPanel({ flags }: { flags: FlagItem[] }) {
  if (!flags.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flags.map((flag) => (
          <div key={flag.id} className="rounded-md border p-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getSeverityVariant(flag.severity)}>{flag.severity}</Badge>
              <Badge variant="outline">{flag.type.replace(/_/g, " ")}</Badge>
              <Badge variant="secondary">{flag.status}</Badge>
            </div>
            {flag.evidence?.recommendation?.text ? (
              <div className="text-sm">
                <span className="font-medium">Recommendation:</span> {flag.evidence.recommendation.text}
              </div>
            ) : null}
            {flag.evidence?.recommendation?.snippet ? (
              <div className="text-xs text-muted-foreground">
                “{flag.evidence.recommendation.snippet}”
              </div>
            ) : null}
            <div className="text-xs text-muted-foreground">
              Created {new Date(flag.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
