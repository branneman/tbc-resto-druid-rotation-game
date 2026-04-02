export default function Icon({ name, size, props }) {
  return (
    <svg height={size} width={size} {...props}>
      <image href={`/icons/${name}.jpg`} />
    </svg>
  )
}
