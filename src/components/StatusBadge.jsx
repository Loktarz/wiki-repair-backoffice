const MAP = {
  EN_ATTENTE_DEPOT:        ['gray',   'En attente dépôt'],
  DEPOSE_MAGASIN:          ['gray',   'Déposé magasin'],
  FICHE_REPARATION_IMPRIMEE:['gray',  'Fiche imprimée'],
  DIAGNOSTIC_EN_ATTENTE:   ['blue',   'Diag. en attente'],
  EN_DIAGNOSTIC:           ['blue',   'En diagnostic'],
  DIAGNOSTIC_TERMINE:      ['blue',   'Diagnostic terminé'],
  DEVIS_EN_ATTENTE:        ['yellow', 'Devis en attente'],
  DEVIS_ENVOYE_CLIENT:     ['yellow', 'Devis envoyé'],
  DEVIS_ACCEPTE:           ['green',  'Devis accepté'],
  DEVIS_REFUSE:            ['red',    'Devis refusé'],
  TENTATIVE_REPARATION:    ['orange', 'Tentative réparation'],
  ATTENTE_PIECE:           ['orange', 'Attente pièce'],
  PIECE_RECUE:             ['orange', 'Pièce reçue'],
  EN_REPARATION:           ['orange', 'En réparation'],
  REPARATION_TERMINEE:     ['green',  'Réparation terminée'],
  PRET_RETRAIT:            ['teal',   'Prêt retrait'],
  LIVRE_CLIENT:            ['teal',   'Livré client'],
  REPARATION_IMPOSSIBLE:   ['red',    'Réparation impossible'],
}

const COLORS = {
  gray:   'bg-gray-100 text-gray-600',
  blue:   'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  teal:   'bg-teal-100 text-teal-700',
}

export default function StatusBadge({ status }) {
  const [color, label] = MAP[status] || ['gray', status]
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[color]}`}>
      {label}
    </span>
  )
}
