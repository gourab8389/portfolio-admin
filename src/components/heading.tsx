
interface HeadingProps {
        title: string;
        description: string;
}
const Heading = ({ title, description }: HeadingProps) => {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export default Heading
