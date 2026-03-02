
const ItemCount = ({title, count}: {title: string, count: number}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
        <p className="text-4xl font-bold text-accent">{count}</p>
    </div>
  )
}

export default ItemCount