
import { type FC } from 'react';
// import Banner from '../../components/Banner/Banner'
// import Categories from '../../components/Categories/Categories'
// import HospitalList from '../../components/HospitalList/HospitalList'

const Home: FC = () => {
    // const [selectedCategory, setSelectedCategory] = useState<string>('Cardiology');

    // const handleCategoryChange = (category: string) => {
    //     setSelectedCategory(category);
    // };

    return (

        <main className="flex-1 w-full">
            <div className="space-y-3 lg:space-y-4">
                <div className="lg:hidden">
                    {/* <Categories
                        onCategoryChange={handleCategoryChange}
                        initialCategory={selectedCategory}
                    />
                    <Banner /> */}
                </div>
                <div className="hidden lg:block">
                    {/* <Banner />
                    <Categories
                        onCategoryChange={handleCategoryChange}
                        initialCategory={selectedCategory}
                    /> */}
                </div>
                {/* <HospitalList selectedCategory={selectedCategory} /> */}
            </div>
        </main>
    )
}

export default Home