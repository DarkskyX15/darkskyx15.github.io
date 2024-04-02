/*
 * @Date: 2024-03-28 18:19:40
 * @Author: DarkskyX15
 * @LastEditTime: 2024-04-02 01:52:42
 */
#ifndef DS_KNN_HPP
#define DS_KNN_HPP

#include <chrono>
#include <random>
#include <string>
#include <vector>
#include <queue>
#include <math.h>
#include <iostream>
#include <fstream>
#include <functional>
#include <utility>
#include <initializer_list>
#include <algorithm>
#include <charconv>
#include <unordered_map>
#include <set>

namespace knn {

    /// @brief 简单的用于计时的工具类
    class Timer { 
        public:
        /// @brief 获取开始时刻
        inline void start() {
            t_start = std::chrono::steady_clock::now();
        }
        /// @brief 获取结束时刻并输出，单位us
        inline void end(const char* __action) {
            t_end = std::chrono::steady_clock::now();
            interval = std::chrono::duration_cast<std::chrono::microseconds>(t_end - t_start);
            std::cout << __action << " took " << Timer::interval.count() << "us." << '\n';
        }
        private:
        std::chrono::time_point<std::chrono::steady_clock> t_start, t_end;
        std::chrono::microseconds interval;
    };

    /// @brief 一条数据记录
    /// @tparam __T 向量的数据类型
    /// @tparam __ST 类别的数据类型
    template<class __T, class __ST>
    struct Record {
        std::vector<__T> vec;
        __ST state;
    };

    /// @brief KDTree的节点
    /// @tparam __T 向量的数据类型
    /// @tparam __ST 类别的数据类型
    template<class __T, class __ST>
    struct KDNode {
        const Record<__T, __ST>* rec_ptr;
        KDNode<__T, __ST> *left_ptr, *right_ptr, *father;
    };


    /// @brief 数据集基类
    /// @tparam __T 向量中的数据类型
    /// @tparam __ST 数据分类的数据类型
    template<class __T, class __ST>
    class DataSet {
        public:
        /// @brief 返回编号对应的数据记录的指针
        /// @param __index 编号
        /// @return 指向对应数据的指针
        virtual Record<__T, __ST>* getRef(long long __index) = 0;
        virtual const Record<__T, __ST>* getRef(long long __index) const = 0;
        /// @brief 返回数据维度
        /// @return 表维度的`long long`
        virtual long long getDimension() const = 0;
        /// @brief 返回数据集大小
        /// @return 表大小的`long long`
        virtual long long dataSize() const = 0;
        virtual inline void appendRecord(const std::vector<__T>& __vec, const __ST __state) = 0;
        virtual inline void appendRecord(const Record<__T, __ST>& __record) = 0;
        virtual void clear() = 0;
    };

    /// @brief 实现的基本数据集
    /// @tparam __T 向量中的数据类型
    /// @tparam __ST 标签的数据类型
    template<class __T, class __ST>
    class DefaultDataSet : public DataSet<__T, __ST> {
        public:
        /// @brief 以给定维度初始化
        /// @param __dimension 维度
        DefaultDataSet(long long __dimension) : data() {
            dimension = __dimension;
            tot_samples = 0;
        }
        /// @brief 以提供的维度和总量初始化
        /// @param __dimension 维度
        /// @param __tot 总数据数
        DefaultDataSet(long long __dimension, long long __tot) : data() {
            dimension = __dimension;
            tot_samples = 0;
            data.reserve(__tot);
        }
        /// @brief 列表初始化
        /// @param __list 初始化列表
        DefaultDataSet(const std::initializer_list<Record<__T, __ST>>& __list) : data() {
            dimension = __list.begin()->vec.size();
            tot_samples = 0;
            for (auto it = __list.begin(); it != __list.end(); ++it, ++tot_samples) {
                data.push_back(*it);
            }
        }
        DefaultDataSet(const DefaultDataSet& __dataset) = default;
        
        /// @brief 添加数据记录
        /// @param __record 记录
        inline void appendRecord(const std::vector<__T>& __vec, const __ST __state) override {
            tot_samples += 1;
            data.push_back(Record<__T, __ST>{__vec, __state});
        }
        inline void appendRecord(const Record<__T, __ST>& __record) override {
            tot_samples += 1;
            data.push_back(__record);
        }

        /// @brief z-score法标准化
        void zScoreNormalization() {
            for (int dim = 0; dim < dimension; ++dim) {
                double __mean = 0.0, __std_o = 0.0;
                for (int i = 0; i < tot_samples; ++i) {
                    __mean += data[i].vec[dim];
                }
                __mean /= static_cast<double>(tot_samples);
                for (int i = 0; i < tot_samples; ++i) {
                    __std_o += (data[i].vec[dim] - __mean) * (data[i].vec[dim] - __mean);
                }
                __std_o /= static_cast<double>(tot_samples);
                __std_o = std::sqrt(__std_o);

                for (int i = 0; i < tot_samples; ++i) {
                    data[i].vec[dim] = (data[i].vec[dim] - __mean) / __std_o;
                }
            }
        }

        void clear() override {
            data.clear();
            tot_samples = 0;
        }

        Record<__T, __ST>* getRef(long long __index) override {
            return &data.at(__index);
        }
        const Record<__T, __ST>* getRef(long long __index) const override {
            return &data.at(__index);
        }

        long long getDimension() const override {
            return this->dimension;
        }
        long long dataSize() const override {
            return this->tot_samples;
        }

        private:
        std::vector< Record<__T, __ST> > data;
        long long dimension, tot_samples;
    };

    /// @brief 一致的权重
    template<class __T, class __DT>
    __DT uniformWeight(__DT distance, const std::vector<__T>* __record) {
        return distance;
    }

    /// @brief 欧氏距离
    template<class __T, class __DT>
    __DT euclidean(const std::vector<__T>* __record, const std::vector<__T>* __sample) {
        __DT dis{0}, x, z;
        for (auto it = __record->begin(), sit = __sample->begin(); 
            it != __record->end() && sit != __sample->end(); ++it, ++sit) {
            x = static_cast<__DT>(*it); z = static_cast<__DT>(*sit);
            z -= x; z *= z; dis += z;
        }
        return std::sqrt(dis);
    }
    /// @brief 曼哈顿距离
    template<class __T, class __DT>
    __DT manhattan(const std::vector<__T>* __record, const std::vector<__T>* __sample) {
        __DT dis{0};
        for (auto it = __record->begin(), sit = __sample->begin();
            it != __record->end() && sit != __record->end(); ++it, ++sit) {
                dis += std::abs(static_cast<__DT>(*it - *sit));
        }
        return dis;
    }

    template<class __T, class __DT, class __ST>
    class BaseKNN {
        public:
        virtual void get(const std::vector<__T>& __vec, int k,
                        std::vector<const Record<__T, __ST>*>& __container) = 0;
    };

    /// @brief 暴力法KNN
    /// @tparam __T 数据集中的数据类型 `Type`
    /// @tparam __DT 距离计算过程中的数据类型 `Distance Type`
    /// @tparam __ST 数据分类的数据类型 `State Type`
    template<class __T, class __DT, class __ST>
    class Brute : public BaseKNN<__T, __DT, __ST> {
        public:
        /// @brief 以指定数据集，权重函数和距离函数初始化
        /// @param __dataset 数据集
        /// @param __weight_func 权重函数，类型为`__DT(__DT, const std::vector<__T>*)`
        /// @param __distance_func 距离函数，类型为`__DT(const std::vector<__T>*, const std::vector<__T>*)`
        Brute(const DataSet<__T, __ST>& __dataset, 
            std::function<__DT(__DT, const std::vector<__T>*)> __weight_func = uniformWeight<__T, __DT>,
            std::function<__DT(const std::vector<__T>*, const std::vector<__T>*)> __distance_func = euclidean<__T, __DT>) :
            tm() {
            data_ptr = &__dataset;
            weight_func = __weight_func;
            distance_func = __distance_func;
        }
        /// @brief 获取结果
        /// @param __vec 预测的向量
        /// @param k 参数k
        /// @param __container 储存结果的容器，类型为`std::vector<const Record<__T, __ST>*>`
        void get(const std::vector<__T>& __vec, int k,
                std::vector<const Record<__T, __ST>*>& __container) override {
            typedef std::pair<const Record<__T, __ST>*, __DT> dpair;
            auto cmp = [](const dpair& left, const dpair& right){
                if (left.second < right.second) return true;
                return false;
            };
            std::priority_queue<dpair, std::vector<dpair>, decltype(cmp)> kq(cmp);
            
            const Record<__T, __ST>* __rec_ptr;
            for (long long i = 0; i < data_ptr->dataSize(); ++i) {
                __rec_ptr = data_ptr->getRef(i);
                __DT val = weight_func(distance_func(&(__rec_ptr->vec),&__vec),
                                    &(__rec_ptr->vec));
                if (kq.size() < k) {
                    kq.push(std::make_pair(__rec_ptr, val));
                } else {
                    if (val < kq.top().second) {
                        kq.pop();
                        kq.push(std::make_pair(__rec_ptr, val));
                    }
                }
            }
            int size = kq.size();
            __container.resize(size);
            while (size > 0) {
                __container[size - 1] = kq.top().first;
                kq.pop(); --size;
            }
        }
        private:
        const DataSet<__T, __ST>* data_ptr; Timer tm;
        std::function<__DT(__DT, const std::vector<__T>*)> weight_func;
        std::function<__DT(const std::vector<__T>*, const std::vector<__T>*)> distance_func;
    };

    /// @brief 向量排序使用的比较
    template<class __T, class __ST>
    class KDSort {
        public:
        KDSort(long long __dimension) {
            dim = __dimension;
        }
        bool operator() (const Record<__T, __ST>* left, const Record<__T, __ST>* right) {
            if (left->vec.at(dim) < right->vec.at(dim)) return true;
            return false;
        }
        private:
        long long dim;
    };

    /// @brief K-Dimension Tree法KNN
    /// @tparam __T 数据集中的数据类型 `Type`
    /// @tparam __DT 距离计算过程中的数据类型 `Distance Type`
    /// @tparam __ST 数据分类的数据类型 `State Type`
    template<class __T, class __DT, class __ST>
    class KDTree : public BaseKNN<__T, __DT, __ST>{
        public:
        /// @brief 以指定数据集，权重函数和距离函数初始化
        /// @param __dataset 数据集
        /// @param __weight_func 权重函数，类型为`__DT(__DT, const std::vector<__T>*)`
        /// @param __distance_func 距离函数，类型为`__DT(const std::vector<__T>*, const std::vector<__T>*)`
        KDTree(const DataSet<__T, __ST>& __dataset, 
            std::function<__DT(__DT, const std::vector<__T>*)> __weight_func = uniformWeight<__T, __DT>,
            std::function<__DT(const std::vector<__T>*, const std::vector<__T>*)> __distance_func = euclidean<__T, __DT>) {
            data_ptr = &__dataset;
            dimension = data_ptr->getDimension();
            std::vector<const Record<__T, __ST>*> __vec;
            root = new KDNode<__T, __ST>();

            weight_func = __weight_func;
            distance_func = __distance_func;
            __vec.reserve(data_ptr->dataSize());
            root->father = root;
            for (long long i = 0; i < data_ptr->dataSize(); ++i) {
                __vec.push_back(data_ptr->getRef(i));
            }

            sort(__vec.begin(), __vec.end(), KDSort<__T, __ST>(0));
            long long mid = (__vec.size() >> 1);
            root->rec_ptr = __vec[mid];
            root->left_ptr = construct(__vec, 1, __vec.begin(), __vec.begin() + mid, root);
            root->right_ptr = construct(__vec, 1, __vec.begin() + mid + 1, __vec.end(), root);
        }
        ~KDTree(){
            if (root != nullptr) {
                deconstruct(root);
                root = nullptr;
            }
        }
        
        /// @brief 获取结果，不保证返回数量为k
        /// @param __vec 预测的向量
        /// @param k 参数k
        /// @param __container 储存结果的容器，类型为`std::vector<const Record<__T, __ST>*>`
        void get(const std::vector<__T>& __vec, int k, 
                std::vector<const Record<__T, __ST>*>& __container) override {
            check_map.clear();
            __container.clear();

            tpk_type tpk;
            searchTree(root, __vec, 0, tpk, k);
            __container.resize(tpk.size());
            while (tpk.size()) {
                __container[tpk.size() - 1] = tpk.top().first;
                tpk.pop();
            }
        }

        private:
        typedef typename std::vector<const Record<__T, __ST>*>::iterator vecit;
        typedef std::pair<const Record<__T, __ST>*, __DT> dpair;
        struct KDHeap {
            bool operator()(const dpair& left, const dpair& right) {
                if (left.second < right.second) return true;
                return false;
            }
        };
        typedef std::priority_queue<dpair, std::vector<dpair>, KDHeap> tpk_type;

        KDNode<__T, __ST>* construct(std::vector<const Record<__T, __ST>*>& __vec,
                                    int depth, vecit left, vecit right, KDNode<__T, __ST>* fa) {
            if (left == right) return nullptr;
            KDNode<__T, __ST>* ptr = new KDNode<__T, __ST>();
            ptr->father = fa;
            if (right - left == 1) {
                ptr->rec_ptr = *left;
            } else {
                std::sort(left, right, KDSort<__T, __ST>(depth % dimension));
                long long mid = ((right - left) >> 1);
                ptr->rec_ptr = *(left + mid);
                ptr->left_ptr = construct(__vec, depth + 1, left, left + mid, ptr);
                ptr->right_ptr = construct(__vec, depth + 1, left + mid + 1, right, ptr);
            }
            return ptr;
        }
        void deconstruct(KDNode<__T, __ST>* ptr) {
            if (ptr->left_ptr != nullptr) deconstruct(ptr->left_ptr);
            if (ptr->right_ptr != nullptr) deconstruct(ptr->right_ptr);
            delete ptr;
        }
        void searchTree(const KDNode<__T, __ST>* __present, const std::vector<__T>& __vec,
                    int depth, tpk_type& __tpk, const int k) {
            auto it = check_map.find(__present);
            if (it != check_map.end()) return ;

            long long index = depth % dimension;
            __DT distance = weight_func(distance_func(&(__present->rec_ptr->vec), &__vec), &__vec);
            bool left_flg = (__vec[index] < __present->rec_ptr->vec[index]) ? true : false;

            if (__present->left_ptr == nullptr && __present->right_ptr == nullptr) {
                check_map.insert(__present);
                if (__tpk.size() < k) __tpk.push(std::make_pair(__present->rec_ptr, distance));
                else if (distance < __tpk.top().second) {
                    __tpk.pop();
                    __tpk.push(std::make_pair(__present->rec_ptr, distance));
                }
                return ;
            }
            
            if (left_flg) {
                if (__present->left_ptr != nullptr) {
                    searchTree(__present->left_ptr, __vec, depth + 1, __tpk, k);
                }
            } else {
                if (__present->right_ptr != nullptr) {
                    searchTree(__present->right_ptr, __vec, depth + 1, __tpk, k);
                }
            }
            
            check_map.insert(__present);
            if (__present->father == __present) return ;
            bool next_flg = false;
            if (__tpk.size() < k) {
                next_flg = true;
                __tpk.push(std::make_pair(__present->rec_ptr, distance));
            } else if (distance < __tpk.top().second) {
                next_flg = true;  __tpk.pop();
                __tpk.push(std::make_pair(__present->rec_ptr, distance));
            }
            if (next_flg) {
                if (left_flg) {
                    if (__present->right_ptr != nullptr) {
                        searchTree(__present->right_ptr, __vec, depth + 1, __tpk, k);
                    }
                } else {
                    if (__present->left_ptr != nullptr) {
                        searchTree(__present->left_ptr, __vec, depth + 1, __tpk, k);
                    }
                }
            } else return;
        }

        long long dimension;
        Timer tm;
        std::set<const KDNode<__T, __ST>*> check_map;
        KDNode<__T, __ST>* root;
        const DataSet<__T, __ST>* data_ptr;
        std::function<__DT(__DT, const std::vector<__T>*)> weight_func;
        std::function<__DT(const std::vector<__T>*, const std::vector<__T>*)> distance_func;
    };

    /// @brief 分割字符串
    /// @param __str 原字符串
    /// @param __container 存储结果的容器
    /// @param __sep 分割字符
    void splitString(const std::string& __str, 
                    std::vector<std::string>& __container,
                    const char __sep = ' ') {
        std::string temp;
        long long left = 0, right = 0;
        long long send = __str.size();
        while (left < send && right < send) {
            if (__str.at(right) == __sep) {
                temp = __str.substr(left, right - left);
                if (temp.size()) __container.push_back(temp);
                left = right + 1;
            }
            right += 1;
        }
        temp = __str.substr(left, right - left);
        if (temp.size()) __container.push_back(temp);
    }

    template<class __T, class __ST>
    class ReadLineFunc {
        public:
        virtual Record<__T, __ST> operator() (const std::string& __str) const = 0;
    };

    /// @brief 实现的基本行读取函数对象，适用于类csv格式
    /// @tparam __T 数据类型
    /// @tparam __ST 标签类型
    template<class __T, class __ST>
    class DefaultReadLine : public ReadLineFunc<__T, __ST> {
        public:
        /// @brief 初始化函数对象
        /// @param __sep 分隔符
        /// @param __dimension 特征数
        DefaultReadLine(char __sep, long long __dimension):
        sep(__sep), dimense(__dimension) {}

        Record<__T, __ST> operator() (const std::string& __str) const override {
            std::vector<std::string> temp;
            std::vector<__T> __vec;
            __T px; __ST xx;
            splitString(__str, temp, sep);
            for (long long i = 0; i < dimense; ++i) {
                std::from_chars(temp[i].c_str(), temp[i].c_str() + temp[i].size(), px);
                __vec.push_back(px);
            }
            std::from_chars(temp[dimense].c_str(), temp[dimense].c_str() + temp[dimense].size(), xx);
            return Record<__T, __ST>{__vec, xx};
        }

        private:
        char sep;
        long long dimense;
    };

    template<class __T, class __ST>
    /// @brief 从文件中读入数据集
    /// @tparam __T 向量数据类型
    /// @tparam __ST 标签数据类型
    /// @param __filename 文件名
    /// @param __ds_ref 数据集的引用
    /// @param __line_func 对于每一行执行的函数
    void readDatasetFile(const char* __filename, DataSet<__T, __ST>& __ds_ref, 
                        std::function<Record<__T, __ST>(const std::string&)> __line_func) {
        std::ifstream ifs(__filename, std::ios::in);
        if (ifs.is_open()) {
            std::string __buf;
            while (std::getline(ifs, __buf)) {
                if (__buf.size()) __ds_ref.appendRecord(__line_func(__buf));
            }
            ifs.close();
        }
    }

    template<class __T, class __ST>
    /// @brief 从文件中读入数据集（针对函数对象重载）
    /// @tparam __T 数据类型
    /// @tparam __ST 标签类型
    /// @param __filename 文件名
    /// @param __ds_ref 数据集的引用
    /// @param __line_func_obj 函数对象 (`ReadLineFunc`的子类)
    void readDatasetFile(const char* __filename, DataSet<__T, __ST>& __ds_ref, 
                        const ReadLineFunc<__T, __ST>& __line_func_obj) {
        std::ifstream ifs(__filename, std::ios::in);
        if (ifs.is_open()) {
            std::string __buf;
            while (std::getline(ifs, __buf)) {
                if (__buf.size()) __ds_ref.appendRecord(__line_func_obj(__buf));
            }
            ifs.close();
        }
    }

    template<class __T, class __ST>
    /// @brief 格式化打印结果，包括选取的数据信息以及标签的数量统计
    /// @tparam __T 向量数据类型
    /// @tparam __ST 标签数据类型
    /// @param __ret_vec 任意KNN对象的`get`方法返回的记录指针数组
    /// @param __detail_display 是否打印详细信息
    void collectResult(const std::vector<const Record<__T, __ST>*>& __ret_vec, 
                       bool __detail_display = true) {
        if (__detail_display) {
            std::cout << "----------------------------" << '\n';
            std::cout << "According to ascending order:\n";
        }
        std::unordered_map<__ST, int> collect;
        const Record<__T, __ST>* __rec;
        for (int i = 0; i < __ret_vec.size(); ++i) {
            __rec = __ret_vec.at(i);
            if (__detail_display) {
                for (int j = 0; j < __rec->vec.size(); ++j) {
                    std::cout << __rec->vec[j] << "\t";
                }
                std::cout << "  ->  " << __rec->state << '\n';
            }
            auto it = collect.find(__rec->state);
            if (it != collect.end()) {
                it->second += 1;
            } else {
                collect[__rec->state] = 1;
            }
        }
        std::cout << "----------------------------" << '\n';
        std::cout << "Summary:" << '\n';
        for (auto it = collect.begin(); it != collect.end(); ++it) {
            std::cout << it->first << " : " << it->second << " | "
                    << (static_cast<double>(it->second) / __ret_vec.size()) << '\n';
        }
        std::cout << "----------------------------" << '\n';
        std::flush(std::cout);
    }

    template<class __T, class __ST>
    /// @brief 由指定数据集创建训练集和测试集
    /// @tparam __T 数据类型
    /// @tparam __ST 标签类型
    /// @param __source 源数据集
    /// @param __training_group 指定的训练集
    /// @param __test_group 指定的测试集
    /// @param __test_size 测试集大小
    void selectTestGroup(const DataSet<__T, __ST>& __source, DataSet<__T, __ST>& __training_group, 
                         DataSet<__T, __ST>& __test_group, long long __test_size) {
        if (__test_size < 0) return ;
        if (__test_size > __source.dataSize()) return;

        std::set<long long> check_map;
        std::random_device r;
        std::default_random_engine rand_engine(r());
        std::uniform_int_distribution<long long> distribute(0, __source.dataSize() - 1);
        
        long long x;
        while (__test_size) {
            x = distribute(rand_engine);
            if (check_map.find(x) == check_map.end()) {
                check_map.insert(x);
                __test_group.appendRecord(*(__source.getRef(x)));
                --__test_size;
            }
        }
        for (long long i = 0; i < __source.dataSize(); ++i) {
            if (check_map.find(i) == check_map.end()) {
                __training_group.appendRecord(*(__source.getRef(i)));
            }
        }
    }
    
    template<class __T, class __DT, class __ST>
    /// @brief 检查k取特定值时预测的正确率
    /// @tparam __T 数据类型
    /// @tparam __DT 距离类型
    /// @tparam __ST 标签类型
    /// @param __knn `BaseKNN`对象
    /// @param __test_k k值
    /// @param __test_set 测试集
    /// @return 正确率
    double testCorrectness(BaseKNN<__T, __DT, __ST>& __knn, int __test_k,
                         const DataSet<__T, __ST>& __test_set) {
        long long correct = 0;
        std::vector<const Record<__T, __ST>*> results;
        std::unordered_map<__ST, int> collect;
        
        for (int i = 0; i < __test_set.dataSize(); ++i) {
            results.clear();  collect.clear();
            const Record<__T, __ST>* ptr = __test_set.getRef(i);
            __knn.get(ptr->vec, __test_k, results);
            for (auto it = results.begin(); it != results.end(); ++it) {
                auto mit = collect.find((*it)->state);
                if (mit == collect.end()) collect[(*it)->state] = 1;
                else mit->second += 1;
            }
            int __max = INT_MIN; __ST label;
            for (auto it = collect.begin(); it != collect.end(); ++it) {
                if (it->second > __max) {
                    __max = it->second;
                    label = it->first;
                }
            }
            correct += (label == ptr->state) ? 1 : 0;
        }
        return static_cast<double>(correct) / __test_set.dataSize();
    }

    template<class __T, class __DT, class __ST>
    /// @brief 尝试选取最优的K
    /// @tparam __T 数据类型
    /// @tparam __DT 距离类型
    /// @tparam __ST 标签类型
    /// @param __data_set 数据集
    /// @param iteration_cnt 迭代次数
    /// @param __lower k的初始值
    /// @param __upper k的最大值
    /// @param __test_size 测试点个数
    /// @param __result_size K保留个数
    /// @param __container 结果容器，类型为`std::vector<std::pair<int, double>>`
    void optimizeKDTree(const DataSet<__T, __ST>& data_set, int iteration_cnt,
                        int __lower, int __upper, int __test_size,
                        int __result_size, std::vector<std::pair<int, double>>& __container) {
        Timer tm;
        std::unordered_map<int, double> k_map;
        long long dimense = data_set.getDimension();

        tm.start();
        for (int iter = 0; iter < iteration_cnt; ++iter) {
            DefaultDataSet<__T, __ST> train(dimense), test(dimense);
            selectTestGroup(data_set, train, test, __test_size);
            KDTree<__T, __DT, __ST> knn(train);

            for (int k = __lower; k <= __upper; ++k) {
                double c = testCorrectness(knn, k, test);
                auto it = k_map.find(k);
                if (it == k_map.end()) k_map[k] = c;
                else it->second += c;
            }
        }
        tm.end("Iteration");

        tm.start();
        typedef std::pair<int, double> pnode;
        auto cmp = [](pnode& left, pnode& right){
            if (left.second < right.second) return true;
            return false;
        };
        std::priority_queue<pnode, std::vector<pnode>, decltype(cmp)> bheap(cmp);
        for (auto it = k_map.begin(); it != k_map.end(); ++it) {
            it->second /= static_cast<double>(iteration_cnt);
            bheap.push(*it);
        }

        while (__result_size && bheap.size()) {
            __container.push_back(bheap.top());
            bheap.pop();
            --__result_size;
        }
        tm.end("Collect K Data");
    }

} /* namespace knn */

#endif /* DS_KNN_HPP */